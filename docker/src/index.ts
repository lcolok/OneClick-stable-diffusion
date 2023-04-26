import {
  intro,
  outro,
  confirm,
  select,
  spinner,
  isCancel,
  cancel,
  text,
} from "@clack/prompts";

import i18next from './i18n';
import { setTimeout as sleep } from "node:timers/promises";
import pc from "picocolors";
import { buildImageSelection } from "./commands/build";
import { launchContainer } from "./commands/launch";
import { install } from "./commands/install";
import { clean } from "./commands/clean";
import { selectMenu } from "./utils/menuSelection";
import { gpuMonitor } from "./commands/gpu";

async function main(): Promise<void> {
  intro(pc.inverse(` ${i18next.t("TOOL_NAME")} `));

  const selectedOperation = await selectMenu({
    message: i18next.t("SELECT_OPERATION"),
    operations: [
      {
        label: i18next.t("START_CONTAINER.LABEL"),
        hint: pc.bold(pc.yellow(i18next.t("START_CONTAINER.HINT"))),
        action: launchContainer,
      },
      {
        label: i18next.t("BUILD_IMAGE.LABEL"),
        hint: pc.bold(pc.yellow(i18next.t("BUILD_IMAGE.HINT"))),
        action: buildImageSelection,
      },
      {
        label: i18next.t("INSTALL_SERVICE.LABEL"),
        hint: pc.bold(pc.yellow(i18next.t("INSTALL_SERVICE.HINT"))),
        action: install,
      },
      {
        label: i18next.t("CLEAN_IMAGE.LABEL"),
        action: clean,
      },
      {
        label: i18next.t("GPU_STATUS.LABEL"),
        action: gpuMonitor,
      },
    ],
  });

  if (selectedOperation?.action) {
    await selectedOperation.action();
  }
}

main().catch(console.error);
