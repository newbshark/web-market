import { Request, Response } from "express";
import { offerService } from "../services/offer.service.js";

export const getAllOffers = async (req: Request, res: Response) => {
    try{
        const offers = await offerService.getAllOffers();
        res.json({ success: true, data: offers});
    } catch (error){
            const message = error instanceof Error? error.message : 'Unknown error';
            res.status(500).json({ success: false, message });
        }
    }
