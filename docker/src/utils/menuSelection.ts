// 导入所需的模块
import { select, isCancel, cancel } from "@clack/prompts";
import i18next from '../i18n';

/**
 * selectMenu 是一个通用的菜单选择函数，用于在命令行界面中展示一个选项列表供用户选择。
 * 用户可以通过上下箭头键在选项之间进行切换，并通过回车键确认选择。
 * @param {Object} params - 包含 message 和 operations 属性的对象
 * @param {string} params.message - 提示用户的信息
 * @param {Array} params.operations - 操作列表，每个操作包含 label、action 和 hint 属性
 * @returns {Promise<T | null>} 如果用户选择了一个操作，则返回该操作对象；如果用户取消选择，返回 null
 * @template T - 泛型参数，表示操作列表中的对象类型
 */
export async function selectMenu<T>({
  message,
  operations,
}: {
  message: string;
  operations: Array<T & { label: string; action: () => Promise<void>; hint?: string }>;
}): Promise<T | null> {
  // 调用 select 函数展示选项列表，并将用户选择的结果赋值给 selectedItem 变量
  const selectedItem: string | symbol | null = await select({
    message,
    options: operations.map((operation) => ({
      label: operation.label,
      value: operation.action.name,
      hint: operation.hint,
    })),
  });

  // 检查用户是否取消了选择
  if (isCancel(selectedItem)) {
    // 如果用户取消选择，显示取消信息并返回 null
    cancel(i18next.t("OPERATION_CANCELLED")!);
    return null;
  }

  // 如果用户选择了一个操作，则从操作列表中找到该操作并返回
  return operations.find((operation) => operation.action.name === selectedItem) as T;
}