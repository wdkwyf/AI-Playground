# AI Playground

<a href="https://scan.coverity.com/projects/ai-playground">
  <img alt="Coverity Scan Build Status"
       src="https://scan.coverity.com/projects/30694/badge.svg"/>
</a>

![image](https://github.com/user-attachments/assets/ee1efc30-4dd1-4934-9233-53fba00c71bd)


This example is based on the xpu implementation of Intel Arc A-Series dGPU and Ultra iGPU

Welcome to AI Playground beta open source project and AI PC starter app for doing AI image creation, image stylizing, and chatbot on a PC powered by an Intel® Arc™ GPU.  AI Playground leverages libraries from GitHub and Huggingface which may not be available in all countries world-wide.

## README.md
- English (readme.md)

## Min Specs
AI Playground alpha and beta installers are currently available downloadable executables, or available as a source code from our Github repository.  To run AI Playground you must have a PC that meets the following specifications

*	Windows OS
*	Intel Core Ultra-H Processor, Intel Core Ultra 200V series processor OR Intel Arc GPU Series A or Series B (discrete) with 8GB of vRAM

## Installation - Packaged Installer: 
AI Playground has multiple packaged installers, each specific to the hardware. These packages make it easier for an end user to install AI Playground and get it running on their PC. Please note while this does make the process much easier, this is open source beta software, where components and version can have conflicts. Check the Troubleshooting section for known issues.
1. Choose the correct installer (for Desktop systems with Intel Arc GPUs,or for Intel Core Ultra-H systems), download to your PC then run the installer.
2. The installer will have two phases.  It will first install components and environment from the installer. The second phase will pull in components from their source. </b >
This second phase of installation **will take several minutes** and require a steady internet connection.
3. On first run, the load screen will take up to a minute
4. Download the Users Guide for application information

*	AI Playground 2.0 alpha preview (all skus) - [Release Notes](https://github.com/intel/AI-Playground/releases/tag/v2.0.0a-prev) | [Download](https://github.com/intel/AI-Playground/releases/download/v2.0.0a-prev/AI.Playground-v2.0.0-alpha-prev.exe)

*	AI Playground 1.22b - [Release Notes and Download Installers](https://github.com/intel/AI-Playground/releases/tag/v1.22beta) 
<br>Select the appropriate installer for your hardware

*	[AI Playground Users Guide](https://github.com/intel/ai-playground/blob/main/AI%20Playground%20Users%20Guide.pdf)

TROUBLESHOOTING INSTALLATION: 
1. Be sure your system has an Intel Arc GPU. Go to your Windows Start Menu. Type "Device Manager"  Under Display Adapters look at the name of your GPU device. It should describe an an Intel Arc GPU. If it says "Intel(R) Graphics" your system does not have a built-in Intel Arc GPU and does not meet minimum specifications
2. Interrupted Installation: The online installation portion can be interuppted or blocked by an IT network, firewall, or sleep settings.  Be sure to be on an open network, with firewall off, and set sleep settings to stay awake when powered on.
3. Some Windows systems may be missing needed libraries. This can be fixed by installing the 64bit VC++ redistribution from Microsoft here https://learn.microsoft.com/en-us/cpp/windows/latest-supported-vc-redist?view=msvc-170
4. There have been reports of an Huggingface version error. This is due to a 3rd party component changing a version. This issue is corrected in our v1.22b mid November release.  

## Project Development
### Checkout Source Code

To get started, clone the repository and navigate to the project directory:

```cmd
git clone -b dev https://github.com/intel/AI-Playground.git
cd AI-Playground
```

### Install Node.js Dependencies

1. Install the Node.js development environment from (Node.js)[https://nodejs.org/en/download].

2. Navigate to the `WebUI` directory and install all Node.js dependencies:

```cmd
cd WebUI
npm install
```

### Prepare Python Environment

1. Install Miniforge to manage your Conda environment: https://github.com/conda-forge/miniforge

2. Create a Conda environment with Python 3.11 and libuv:
```
conda create -n cp311_libuv python=3.11 libuv -y
```

3. Locate the path to your newly created Conda environment:
```
conda env list | findstr cp311_libuv
```

4. In the `WebUI` directory, execute the `fetch-build-resources` script, replacing `<path_to_cp311_libuv_conda_env>` with the actual path you copied in the previous step:
```
npm run fetch-build-resrouces -- --conda_env_dir=<path_to_cp311_libuv_conda_env>
```

5. Run the `prepare-build` script:
```
npm run prepare-build
```

You should now have a basic Python environment located at `build-envs\online\prototype-python-env`.

### Launch the application

To start the application in development mode, run:

```
npm run dev
```

### (Optional) Build the installer

To build the installer, run:

```
npm run build
```

The installer executable will be located in the `release` folder.

## Model Support
AI Playground supports PyTorch LLM, SD1.5, and SDXL models. AI Playground does not ship with any models but does make  models available for all features either directly from the interface or indirectly by the users downloading models from HuggingFace.co or CivitAI.com and placing them in the appropriate model folder. 

Models currently linked from the application 
| Model                                      | License                                                                                                                                                                      | Background Information/Model Card                                                                                      |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Dreamshaper 8 Model                        | [license](https://huggingface.co/spaces/CompVis/stable-diffusion-license)                                             | [site](https://huggingface.co/Lykon/dreamshaper-8)                               |
| Dreamshaper 8 Inpainting Model             | [license](https://huggingface.co/spaces/CompVis/stable-diffusion-license)                                             | [site](https://huggingface.co/Lykon/dreamshaper-8-inpainting)         |
| JuggernautXL v9 Model                      | [license](https://huggingface.co/spaces/CompVis/stable-diffusion-license)                                             | [site](https://huggingface.co/RunDiffusion/Juggernaut-XL-v9)           |
| Phi3-mini-4k-instruct                      | [license](https://huggingface.co/microsoft/Phi-3-mini-4k-instruct/resolve/main/LICENSE)                 | [site](https://huggingface.co/microsoft/Phi-3-mini-4k-instruct)     |
| bge-large-en-v1.5                          | [license](https://huggingface.co/datasets/choosealicense/licenses/blob/main/markdown/mit.md)                 | [site](https://huggingface.co/BAAI/bge-large-en-v1.5)                         |
| Latent Consistency Model (LCM) LoRA: SD1.5 | [license](https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0/blob/main/LICENSE.md) | [site](https://huggingface.co/latent-consistency/lcm-lora-sdv1-5) |
| Latent Consistency Model (LCM) LoRA:SDXL   | [license](https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0/blob/main/LICENSE.md) | [site](https://huggingface.co/latent-consistency/lcm-lora-sdxl)     |

Be sure to check license terms for any model used in AI Playground especially taking note of any restrictions.

### Use Alternative Models
Check the [User Guide](https://github.com/intel/ai-playground/blob/main/AI%20Playground%20Users%20Guide.pdf) for details or [watch this video](https://www.youtube.com/watch?v=1FXrk9Xcx2g) on how to add alternative Stable Diffusion models to AI Playground

### Notices and Disclaimers: 
For information on AI Playground terms, license and disclaimers, visit the project and files on GitHub repo:</br >
[License](https://github.com/intel/ai-playground/blob/main/LICENSE) | [Notices & Disclaimers](https://github.com/intel/ai-playground/blob/main/notices-disclaimers.md)

The software may include third party components with separate legal notices or governed by other agreements, as may be described in the Third Party Notices file accompanying the software.

