export const success = (data) => ({
    success: true,
    data,
    error: null
});

export const fail = (message) => ({
    success: false,
    data: null,
    error: message
});
