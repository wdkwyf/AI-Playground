# AI Playground for Linux

These instructions illustrate the current steps required to run AI Playground on Linux, with known workarounds.

Supported Configuration:
* Ubuntu 24.04, A770 GPU
* Create, Enhance, and Answer functionality in AI Playground

Currently unsupported configurations and functionality:
* BGM and LNL (missing Python Linux wheels for ipex-llm
* WSL environment on Windows (ipex-llm/oneAPI runtime errors)
* ComfyUI and Llama.cpp - GGUF backends

See 'Known Issues' below for more details

## First time installation

Follow the steps below to install AI Playground on Linux.  These have been tested on a clean installation of Ubuntu 24.04.1 with ARC A770 discrete GPU installed.

1. Install base packages
```bash
$ sudo apt update && sudo apt install -y clinfo curl intel-opencl-icd libgl1 libgomp1 libtbb12 libgtk2.0-0t64 libgtk-3-0t64 libgbm-dev libnotify-dev libnss3 libxss1 libasound2t64 libxtst6 wget xauth xvfb ca-certificates git gnupg
```

2. Install GPU drivers
```bash
$ wget -qO - https://repositories.intel.com/gpu/intel-graphics.key | \
  sudo gpg --yes --dearmor --output /usr/share/keyrings/intel-graphics.gpg && \
  echo "deb [arch=amd64,i386 signed-by=/usr/share/keyrings/intel-graphics.gpg] https://repositories.intel.com/gpu/ubuntu noble client" | \
  sudo tee /etc/apt/sources.list.d/intel-gpu-noble.list && \
  sudo apt update && \
  sudo apt install -y libze-intel-gpu1 libze1 intel-opencl-icd clinfo intel-gsc libze-dev intel-ocloc
```

3. Install latest NPM > 10.x
```bash
$ curl -fsSL https://deb.nodesource.com/setup_22.x -o nodesource_setup.sh && \
  sudo -E bash nodesource_setup.sh && \
  sudo apt install -y nodejs
```

4. Install Mambaforge
```bash
$ cd /tmp && \
  wget "https://github.com/conda-forge/miniforge/releases/latest/download/Miniforge3-$(uname)-$(uname -m).sh" && \
  bash Miniforge3-$(uname)-$(uname -m).sh -b && \
  rm Miniforge3-$(uname)-$(uname -m).sh 
```

5. Python environment
```bash
$ source ~/miniforge3/bin/activate && \
  conda create -n cp311_libuv python=3.11 libuv -y && \
  conda_path=$(conda env list | grep cp311_libuv | awk '{print $2}')
```

6. Install AI Playground
```bash
$ cd && \
  git clone -b dev https://github.com/wdkwyf/AI-Playground && \
  cd AI-Playground/WebUI && \
  npm install && \
  npm run fetch-build-resources -- --conda_env_dir=$conda_path
```

*Workaround*: currently need to manually edit path and replace with vlue of $conda_path/bin.  Here is an example below diff
```
--git a/WebUI/build/scripts/prepare-python-env.js b/WebUI/build/scripts/prepare-python-env.js
index 30f7812..46133cf 100644
--- a/WebUI/build/scripts/prepare-python-env.js
+++ b/WebUI/build/scripts/prepare-python-env.js
@@ -48,7 +48,7 @@ function preparePythonEnvDir(pyEnvTargetPath) {

 function createPythonEnvFromEmbedabblePythonZip(targetDir) {
     preparePythonEnvDir(targetDir);
-    fs.cpSync('/home/lvjingang01/miniforge3/envs/cp311_libuv/bin',targetDir,{recursive:true});
+    
+ fs.cpSync('/home/matt/miniforge3/envs/cp311_libuv/bin',targetDir,{recu
+ rsive:true});
     console.log('Creating python env.')

     // const pythonEmbed = new AdmZip(pythonEmbedZipFile);
```

7. Complete AI Playground installation
```bash
$ npm run prepare-build
$ npm run dev
```

8. Launch the user interface and click on the 'Install' button to complete the remaining Python runtime dependencies required by AI Playground.  

*Workaround*: Sometimes the 'continue' button does not work.  Workaround is to close app and relaunch using 'npm run dev' command


## Subsequent Invocations

Follow the steps below to subsequently run AI Playground, after it has been installed above.

```bash
$ source ~/miniforge3/bin/activate && \
  cd && cd AI-Playground/WebUI && \
  npm run dev
```

## Known Issues

### (Issue #1) Current code requires hard coded path to be modified
prepare-python-env.js has hard coded conda path.  Workaround listed above in installation instructions. [Yufei to resolve this

### (Issue #2) LNL and BGM are not supported
* Current linux port hard codes 'requirements-acm.txt' [Yufei to resolve this]
* In addition, it appears that there are not any Linux wheels for LNL and BGM for ipex-llm *
* Have reached out to Qiacheng Li and Ashok Emani

### (Issue #3) ComfyUI workflow is broken due to apparent Windows dependencies 
* Press 'Create' tab, then press settings icon in upper right hand corner
* In settings dialog, click on 'Workflow' under 'mode' section
* Click on 'Go to Setup' and install Comfy UI installation option, then close app
* Re-launch AI Playground using 'npm run dev' command
* In settings dialog, click on 'Workflow' under 'mode' section
* Type in a prompt to generate image, and accept request to download additional models

Error
```
[ai-backend]: 2025-01-14 10:56:10,356 - INFO - calling cmd process: ['../portable-git/cmd/git.exe', 'clone', 'https://github.com/city96/ComfyUI-GGUF', '../ComfyUI/custom_nodes/ComfyUI-GGUF']

[ai-backend]: 2025-01-14 10:56:10,356 - WARNING - git cloned failed with exception [Errno 2] No such file or directory: '../portable-git/cmd/git.exe'. Cleaning up failed resources.
2025-01-14 10:56:10,356 - ERROR - Failed to install custom comfy node city96/ComfyUI-GGUF due to [Errno 2] No such file or directory: '../portable-git/cmd/git.exe'
2025-01-14 10:56:10,356 - INFO - custom node installation request result: [{'node': 'city96/ComfyUI-GGUF', 'success': False}]
```

### (Issue #4) Llama.cpp backend is broken due to apparent missing Linux wheel dependencies 
* Press 'Answer tab, then press settings icon in upper right hand corner
* In settings dialog, click on 'Basic' tab
* Click on "Mange Backend Components"
* CLick on Enable for 'Llama.cpp - GGUF', then press Install

Error
```
[llamacpp-backend]: Set up of service failed due to Error: File at /home/matt/AI-Playground/WebUI/external/llama_cpp_python-0.3.2-cp311-cp311-linux_x86_64.whl does not exist
[llamacpp-backend]: Aborting set up of llamacpp-backend service environment
[electron-backend]: Received terminal progress update for set up request for llamacpp-backend
```
