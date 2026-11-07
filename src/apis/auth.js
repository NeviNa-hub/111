import request from "@/utils/request";

// 注册新用户。
export const registerUser = (params) =>
  request({ 
    url: "/auth/register", 
    method: "POST", 
    params 
  });

// 用户登录。
export const loginUser = (params) =>
  request({ 
    url: "/auth/login", 
    method: "POST", 
    params 
  });
