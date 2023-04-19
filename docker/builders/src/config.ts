export type BuildConfigType = {
  [key: string]: {
    tag: string;
    dockerfile: string;
    dependencies?: string[];
  };
};

export const buildConfig: BuildConfigType = {
  conda_build: {
    tag: "conda:jupyter",
    dockerfile: "Dockerfile.conda",
  },
  py_build: {
    tag: "py:3.10.6-torch2.0.0",
    dockerfile: "Dockerfile.py",
    dependencies: ["conda_build"],
  },
  sdwebui_base_build: {
    tag: "sdwebui_base:rtx4090",
    dockerfile: "Dockerfile.sdwebui_base",
    dependencies: ["conda_build", "py_build"],
  },
  sdwebui_ext_build: {
    tag: "sdwebui_ext:rtx4090",
    dockerfile: "Dockerfile.sdwebui_ext",
    dependencies: ["conda_build", "py_build", "sdwebui_base_build"],
  },
};
