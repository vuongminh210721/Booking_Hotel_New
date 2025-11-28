export const successResponse = (data: any, message = "Success") => {
  return {
    success: true,
    message,
    data,
  };
};

export const errorResponse = (message: string, errors?: any) => {
  return {
    success: false,
    message,
    ...(errors && { errors }),
  };
};

export const paginationResponse = (
  data: any[],
  page: number,
  limit: number,
  total: number,
) => {
  return {
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};
