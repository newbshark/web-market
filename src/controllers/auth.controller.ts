import { Request, Response } from "express";
import { AuthService } from '../services/auth.service.js';
import { UserService } from '../services/user.service.js';

const authService = new AuthService();
const userService = new UserService();

export const register = async(req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password ){
            return res.status(400).json({
                success: false,
                message: 'All fields (name, email, password) are required'
            });
        }
        const result = await authService.register(name, password, email);
        res.status(201).json(result);
    } catch (error: any) {
    
    console.error('Registration process error:', error.message);
        
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
                message: 'Email and password necessery'
            });
        }
        const result = await authService.login(email, password);
        res.status(200).json(result);
    } catch (error: any) {
        console.error('Sign in eror:', error.message);
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
      return res.status(401).json({ message: 'Non authorised' });
    };
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Name necesserely' });
    const updatedUser = await userService.updateUserName(userId, name);
    res.json({ success: true, user: updatedUser });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
  res.status(400).json({ success: false, message });
}
}
