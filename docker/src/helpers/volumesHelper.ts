import { path as projectRootDir } from 'app-root-path';
import path from 'path';

function generateVolumes({
  host_sdwebui_dir,
  container_sdwebui_dir,
}: Record<string, string>) {
  const volumeMappings = [
    {
      source: '/mnt/flies/AI_research/Stable_Diffusion/.cache',
      target: '/root/.cache',
    },
    {
      source: `${host_sdwebui_dir}/models`,
      target: `${container_sdwebui_dir}/models`,
    },
    {
      source: `${host_sdwebui_dir}/embeddings`,
      target: `${container_sdwebui_dir}/embeddings`,
    },
    {
      source: `${host_sdwebui_dir}/interrogate`,
      target: `${container_sdwebui_dir}/interrogate`,
    },
    {
      source: `${host_sdwebui_dir}/models/SadTalker/checkpoints`,
      target: `${container_sdwebui_dir}/extensions/SadTalker/checkpoints/`,
    },
    {
      source: `${host_sdwebui_dir}/models/SadTalker/gfpgan`,
      target: `${container_sdwebui_dir}/extensions/SadTalker/gfpgan/`,
    },
    {
      source: `${host_sdwebui_dir}/outputs`,
      target: `${container_sdwebui_dir}/outputs`,
    },
    {
      source: `${host_sdwebui_dir}/extensions/sd-webui-controlnet/models`,
      target: `${container_sdwebui_dir}/extensions/sd-webui-controlnet/models`,
    },
    {
      source: `${host_sdwebui_dir}/extensions/sd-webui-controlnet/annotator/downloads`,
      target: `${container_sdwebui_dir}/extensions/sd-webui-controlnet/annotator/downloads`,
    },
    {
      source: `${host_sdwebui_dir}/cache.json`,
      target: `${container_sdwebui_dir}/cache.json`,
    },
    {
      source: `${host_sdwebui_dir}/config.json`,
      target: `${container_sdwebui_dir}/config.json`,
    },
  ];

  const repoRootDir = path.join(projectRootDir, '..');

  const wildcardVolume = {
    source: `${repoRootDir}/configs/wildcards_lib`,
    target: `${container_sdwebui_dir}/extensions/stable-diffusion-webui-wildcards/wildcards`,
  };
  volumeMappings.push(wildcardVolume);

  return volumeMappings.map(({ source, target }) => `${source}:${target}`);
}

export const generatedVolumesForSdWebUI = generateVolumes({
  host_sdwebui_dir:
    '/mnt/flies/AI_research/Stable_Diffusion/stable-diffusion-webui-master',
  container_sdwebui_dir: '/home/stable-diffusion-webui',
});

function generateVolumesForComfyUI({
  host_comfyui_dir,
  container_comfyui_dir,
}: Record<string, string>) {
  const volumeMappings = [
    {
      source: '/mnt/flies/AI_research/Stable_Diffusion/.cache',
      target: '/root/.cache',
    },
    {
      source: `${host_comfyui_dir}/ComfyUI/models`,
      target: `${container_comfyui_dir}/models`,
    },
    {
      source: `${host_comfyui_dir}/stable-diffusion-webui-master/models/Stable-diffusion`,
      target: `${container_comfyui_dir}/models/checkpoints`,
    },
    {
      source: `${host_comfyui_dir}/stable-diffusion-webui-master/extensions/sd-webui-controlnet/models`,
      target: `${container_comfyui_dir}/models/controlnet`,
    },
    {
      source: `${host_comfyui_dir}/stable-diffusion-webui-master/models/Lora`,
      target: `${container_comfyui_dir}/models/loras`,
    },
    {
      source: `${host_comfyui_dir}/ComfyUI/custom_nodes/comfy_controlnet_preprocessors/ckpts`,
      target: `${container_comfyui_dir}/custom_nodes/comfy_controlnet_preprocessors/ckpts`,
    },
  ];

  return volumeMappings.map(({ source, target }) => `${source}:${target}`);
}

export const generatedVolumesForComfyUI = generateVolumesForComfyUI({
  host_comfyui_dir: '/mnt/flies/AI_research/Stable_Diffusion',
  container_comfyui_dir: '/home/ComfyUI',
});
