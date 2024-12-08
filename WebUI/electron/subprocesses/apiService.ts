import {ChildProcess, spawn, spawnSync} from "node:child_process";
import path from "node:path";
import {app} from "electron";
import fs from "fs";
import {settings} from "../main"

export interface ApiService {
    readonly name: string
    readonly port: string
    readonly host: string
    currentStatus: BackendStatus;

    setup(): Promise<void>;
    start(): Promise<BackendStatus>;
    stop(): Promise<BackendStatus>;
}

export class DefaultBackend implements ApiService {
    readonly name = "default"
    readonly port: string
    readonly host: string

    constructor(port: string) {
        this.port = port
        this.host = "127.0.0.1"
    }

    desiredStatus: BackendStatus = {status: "uninitialized"}
    currentStatus: BackendStatus = {status: "uninitialized"}
    encapsulatedProcess: ChildProcess | null = null

    readonly workDir = path.resolve(app.isPackaged ? path.join(process.resourcesPath, "service") : path.join(__dirname, "../../../service"));
    readonly baseDir = app.isPackaged ? process.resourcesPath : path.join(__dirname, "../../../");
    readonly pythonExe = path.resolve(path.join(this.baseDir, "env/python.exe"));

    setup(): Promise<void> {
        //TODO setup with pip install etc
        return Promise.resolve();
    }


    start(): Promise<BackendStatus> {
        if (this.desiredStatus.status === "stopped" && this.currentStatus.status !== "stopped") {
            return Promise.reject('Server currently stopping. Cannot start it.')
        }
        if (this.currentStatus.status === "running") {
            return Promise.resolve({status: "running"})
        }
        if (this.desiredStatus.status === "running") {
            return Promise.reject('Server startup already requested')
        }

        this.desiredStatus = {status: "running"}
        return new Promise<BackendStatus>(async (resolve, reject) => {
            try {
                const trackedProcess = this.spawnAPIProcess(this.pythonExe, this.workDir)
                this.encapsulatedProcess = trackedProcess.process
                if (await this.listenServerReady(trackedProcess.process, trackedProcess.didProcessExitEarlyTracker)) {
                    this.currentStatus = {status: "running"}
                    return resolve({status: "running"});
                } else {
                    this.currentStatus = {status: "failed"}
                    this.encapsulatedProcess?.kill()
                    return resolve({status: "failed"});
                }
            } catch (error) {
                console.error(` failed to start server due to ${error}`, this.name)
                this.currentStatus = {status: "failed"}
                this.encapsulatedProcess?.kill()
                this.encapsulatedProcess = null
                return reject(error)
            }
        })
    }


    stop(): Promise<BackendStatus> {
        console.info(`Stopping backend ${this.name}. It was in state ${this.currentStatus.status}`)
        this.desiredStatus = {status: "stopped"}
        this.encapsulatedProcess?.kill()
        this.encapsulatedProcess = null
        this.currentStatus = {status: "stopped"}
        return Promise.resolve({status: "stopped"})
    }

    spawnAPIProcess(pythonExe: string, wordkDir: string): {process: ChildProcess, didProcessExitEarlyTracker: Promise<boolean>} {
        console.info(` trying to start ${this.name} python API`, this.name)
        const additionalEnvVariables = {
            "SYCL_ENABLE_DEFAULT_CONTEXTS": "1",
            "SYCL_CACHE_PERSISTENT": "1",
            "PYTHONIOENCODING": "utf-8",
            "ONEAPI_DEVICE_SELECTOR": this.oneApiDeviceSelectorVar()
        };

        const apiProcess = spawn(pythonExe, ["web_api.py", "--port", settings.port.toString()], {
            cwd: wordkDir,
            windowsHide: true,
            env: Object.assign(process.env, additionalEnvVariables)
        });

        //must be at the same tick as the spawn function call
        //otherwise we cannot really track errors given the nature of spawn() with a longlived process
        const didProcessExitEarlyTracker = new Promise<boolean>((resolve, reject) => {
            apiProcess.on('exit', () => {
                console.error(`encountered unexpected exit in ${this.name}.`)
                resolve(true);
            });
            apiProcess.on('error', (error) => {
                console.error(`encountered error of process in ${this.name} : ${error}`)
                resolve(true);
            });
        });

        apiProcess.stdout.on('data', (message) => {
            if (message.toString().startsWith('INFO')) {
                console.info(`${message}`, this.name)
            } else if (message.toString().startsWith('WARN')) {
                console.warn(`${message}`, this.name)
            } else {
                console.error(`${message}`, this.name)
            }
        })

        apiProcess.stderr.on('data', (message) => {
            console.error(`${message}`, this.name)
        })
        apiProcess.on('error', (message) => {
            console.error(`backend process ${this.name} exited abruptly due to : ${message}`, this.name)
        })

        return {
            process: apiProcess,
            didProcessExitEarlyTracker: didProcessExitEarlyTracker,
        }
    }

    async listenServerReady(process: ChildProcess, didProcessExitEarlyTracker: Promise<boolean>): Promise<boolean> {
        const processStartupCompletePromise = new Promise<boolean>((resolve) => {
            setTimeout(() => {
                //TODO: call health endpoint or query logs for startup complete log...
                console.log("####### mocked server ready signal return true ####")
                resolve(true)
            }, 4000)
        })

        const processStartupFailedDueToEarlyExit = didProcessExitEarlyTracker.then( earlyExit => !earlyExit)

        return Promise.race([processStartupFailedDueToEarlyExit, processStartupCompletePromise])
    }

    oneApiDeviceSelectorVar(): string {
        // Filter out unsupported devices
        try {
            const lsLevelZeroDevices = path.resolve(path.join(this.baseDir, "service/tools/ls_level_zero.exe"));
            // copy ls_level_zero.exe to env/Library/bin for SYCL environment
            const dest = path.resolve(path.join(this.pythonExe, "../Library/bin/ls_level_zero.exe"));
            fs.copyFileSync(lsLevelZeroDevices, dest);
            const ls = spawnSync(dest);
            console.info(`ls_level_zero.exe stdout: ${ls.stdout.toString()}`, this.name);
            const devices = JSON.parse(ls.stdout.toString());
            const supportedIDs = [];
            for (const device of devices) {
                if (device.name.toLowerCase().includes("arc") || device.device_id === 0xE20B) {
                    supportedIDs.push(device.id);
                }
            }
            const oneapiDeviceSelector = "level_zero:" + supportedIDs.join(",")
            console.info(`Set ONEAPI_DEVICE_SELECTOR=${oneapiDeviceSelector}`, this.name);
            return oneapiDeviceSelector
        } catch (error) {
            console.error(`Failed to detect Level Zero devices: ${error}`, this.name);
            return "level_zero:*"
        }
    }
}
