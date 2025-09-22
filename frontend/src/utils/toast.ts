import { toast } from "sonner";

// Toast utility functions
export const showToast = {
  success: (message: string, description?: string) => {
    toast.success(message, {
      description,
      duration: 4000,
    });
  },

  error: (message: string, description?: string) => {
    toast.error(message, {
      description,
      duration: 6000,
    });
  },

  warning: (message: string, description?: string) => {
    toast.warning(message, {
      description,
      duration: 5000,
    });
  },

  info: (message: string, description?: string) => {
    toast.info(message, {
      description,
      duration: 4000,
    });
  },

  loading: (message: string) => {
    return toast.loading(message);
  },

  dismiss: (toastId?: string | number) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  },

  promise: <T>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => {
    return toast.promise(promise, {
      loading,
      success,
      error,
    });
  },
};

// Helper function to extract error message from API response
export const getErrorMessage = (error: any): string => {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.response?.data?.errorSources?.length > 0) {
    // Handle validation errors
    const firstError = error.response.data.errorSources[0];
    return `${firstError.path}: ${firstError.message}`;
  }

  if (error?.message) {
    return error.message;
  }

  return "An unexpected error occurred";
};

// Helper function to show API error with proper formatting
export const showApiError = (
  error: any,
  defaultMessage = "Operation failed"
) => {
  const message = getErrorMessage(error);

  if (error?.response?.data?.errorSources?.length > 1) {
    // Multiple validation errors
    const errors = error.response.data.errorSources;
    const description = errors
      .map((err: any) => `${err.path}: ${err.message}`)
      .join(", ");
    showToast.error("Validation Error", description);
  } else {
    showToast.error(message || defaultMessage);
  }
};

export default showToast;
