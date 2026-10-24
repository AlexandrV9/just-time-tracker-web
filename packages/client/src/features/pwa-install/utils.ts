import { usePwaInstallDialogStore } from "./usePwaInstallDialogStore";

const PWA_INSTALL_DIALOG_DISMISSED_KEY = "pwa_install_dialog_dismissed";

/**
 * Проверяет, запущено ли приложение с рабочего стола устройства.
 */
export function isStandaloneDisplayMode(): boolean {
  if (typeof window === "undefined") return false;

  return window.matchMedia("(display-mode: standalone)").matches;
}

/**
 * Проверяет, разрешено ли показывать модальное окно с предложением
 * установки приложения на рабочий стол.
 */
export function isPwaInstallDialogDismissed(): boolean {
  if (typeof window === "undefined") return false;

  return localStorage.getItem(PWA_INSTALL_DIALOG_DISMISSED_KEY) === "1";
}

/**
 * Сохраняет отказ от повторного показа модального окна установки PWA.
 */
export function dismissPwaInstallDialog(): void {
  if (typeof window === "undefined") return;

  localStorage.setItem(PWA_INSTALL_DIALOG_DISMISSED_KEY, "1");
}

/**
 * Запрашивает показ модального окна с предложением
 * установки приложения на рабочий стол.
 */
export function requestPwaInstallDialog(): void {
  if (isPwaInstallDialogDismissed() || isStandaloneDisplayMode()) {
    return;
  }

  usePwaInstallDialogStore.getState().setOpen(true);
}
