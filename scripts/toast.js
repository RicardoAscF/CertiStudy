// scripts/toast.js
// Wrapper sencillo para Materialize toast (M.toast)

export function toastSuccess(message, options = {}) {
    const html = options.icon
      ? `<i class="material-icons left">${options.icon}</i>${message}`
      : message;
  
    M.toast({
      html,
      classes: options.classes || "green darken-2",
      displayLength: options.displayLength ?? 1800,
    });
  }
  
  export function toastError(message, options = {}) {
    const html = options.icon
      ? `<i class="material-icons left">${options.icon}</i>${message}`
      : message;
  
    M.toast({
      html,
      classes: options.classes || "red darken-2",
      displayLength: options.displayLength ?? 2500,
    });
  }