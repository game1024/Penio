export const validatePhoneOrEmail = (value: string): boolean => {
    // 手机号正则: 1[3-9]开头的11位数字
    const phoneRegex = /^1[3-9]\d{9}$/;
    // 邮箱正则
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return phoneRegex.test(value) || emailRegex.test(value);
}

export const validatePhone = (value: string): boolean => {
    // 手机号正则: 1[3-9]开头的11位数字
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(value);
}

export const validateEmail = (value: string): boolean => {
    // 邮箱正则
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
}

export const validatePassword = (value: string): boolean => {
    // 密码长度6-64位
    return value.length >= 6 && value.length <= 64;
}

export const validateVerificationCode = (value: string): boolean => {
    // 验证码为6位数字
    const codeRegex = /^\d{6}$/;
    return codeRegex.test(value);
}
