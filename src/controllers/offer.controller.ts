import { Request, Response } from "express";
import { offerService } from "../services/offer.service.js";


export const getAllOffers = async (req: Request, res: Response) => {
    try {
        // GET /offers?searchQuery=холодос&limit=10&page=2
        const offers = await offerService.getAllOffers();
        res.json({ success: true, data: offers});
    } catch (error){
        const message = error instanceof Error? error.message : 'Unknown error';
        res.status(500).json({ success: false, message });
    }
}

export const getUserOffers = async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.params.userId as string, 10);
        if (isNaN(userId)) {
            res.status(400).json({ success: false, message: 'Invalid userId' });
            return;
        }
        const offers = await offerService.getUserOffers(userId);
        res.json({ success: true, data: offers});
    } catch (error){
        const message = error instanceof Error? error.message : 'Unknown error';
        res.status(500).json({ success: false, message });
    }
}
