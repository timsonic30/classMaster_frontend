export default function Toast(message, type = "info", options = {}) {
  const { withPrompt = false, onPromptSubmit } = options;

  const icons = {
    info: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-info h-6 w-6 shrink-0">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>`,
    success: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-success h-6 w-6 shrink-0">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                 </svg>`,
    warning: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-warning h-6 w-6 shrink-0">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                 </svg>`,
    error: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-error h-6 w-6 shrink-0">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
               </svg>`,
  };

  const toast = document.createElement("div");
  toast.className = "fixed inset-0 flex items-center justify-center z-50";

  toast.innerHTML = `
      <div class="fixed inset-0 bg-black/50"></div>
      <div class="flex alert alert-${type} z-50 w-96 shadow-lg relative" role="alert">
        <div class="flex flex-col gap-4 w-full">
          <div class="flex justify-center items-center">
            <div class="flex items-center gap-2">
              ${icons[type]}
              <span>${message}</span>
            </div>
            <button class="absolute -top-2 -right-2 btn btn-xs btn-error cursor-pointer" onclick="this.closest('.fixed').remove()">✕</button>
          </div>
          ${
            withPrompt
              ? `
              <div class="flex flex-col gap-2">
                <input 
                  type="text" 
                  placeholder="Enter your response" 
                  class="input input-bordered w-full" 
                  id="toast-prompt-input"
                />
                <button class="btn btn-primary w-full" id="toast-submit-button">Submit</button>
              </div>
            `
              : ""
          }
        </div>
      </div>
    `;

  if (typeof document !== "undefined") {
    document.body.appendChild(toast);

    if (withPrompt) {
      const input = toast.querySelector("#toast-prompt-input");
      const submitButton = toast.querySelector("#toast-submit-button");

      submitButton.addEventListener("click", () => {
        const value = input.value;
        if (typeof onPromptSubmit === "function") {
          onPromptSubmit(value);
        }
        toast.remove();
      });
    }
  }
}

// Usage:
// showToast("Your message here", "info")    // Blue info alert
// showToast("Your message here", "success") // Green success alert
// showToast("Your message here", "warning") // Yellow warning alert
// showToast("Your message here", "error")   // Red error alert

//  Toast("Your message here", "info", {
//   withPrompt: true,
//   onPromptSubmit: (response) => alert(`Hello, ${response}!`),
// });
