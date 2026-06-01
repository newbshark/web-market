import { Request, Response } from "express";
import { AuthService } from "../services/auth.service.js";

const authService = new AuthService();

export const register = async(req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password ){
            return res.status(400).json({
                success: false,
                message: 'Все поля (name, email, password) обязательны'
            });
        }
        const result = await authService.register(name, password, email);
        res.status(201).json(result);
    } catch (error: any) {
    
    console.error('Ошибка регистрации:', error.message);
        
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
}

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email и password обязательны'
            });
        }
        const result = await authService.login(email, password);
        res.status(200).json(result);
    } catch (error: any) {
        console.error('Ошибка входа:', error.message);
        res.status(401).json({
            success: false,
            message: error.message
        });
    }
};

export const updateUserName = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Не авторизован' });
    };
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Имя обязательно' });
    const updatedUser = await authService.updateUserName(userId, name);
    res.json({ success: true, user: updatedUser });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
  res.status(400).json({ success: false, message });
}
}
