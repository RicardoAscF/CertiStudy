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
  
  export function toastInfo(message, options = {}) {
    const html = options.icon
      ? `<i class="material-icons left">${options.icon}</i>${message}`
      : message;
  
    M.toast({
      html,
      classes: options.classes || "blue darken-2",
      displayLength: options.displayLength ?? 2200,
    });
  }
  
  export function toastWarn(message, options = {}) {
    const html = options.icon
      ? `<i class="material-icons left">${options.icon}</i>${message}`
      : message;
  
    M.toast({
      html,
      classes: options.classes || "orange darken-3",
      displayLength: options.displayLength ?? 2600,
    });
  }