import { MedicationModel } from "../models/medicationModel.js";
import { supabase } from "../config/supabaseClient.js";




export const MedicationController = {
    async getAll(req, res) {
        try {
    // Ambil query param page & limit, default ke 1 dan 10 kalau tidak ada
            const { page, limit } = req.query;

    // Jika page & limit tidak undefined → pakai pagination
            if (page !== undefined && limit !== undefined) {
                const pageNum = parseInt(page, 10);
                const limitNum = parseInt(limit, 10);

                const from = (pageNum - 1) * limitNum;
                const to = from + limitNum - 1;

                const { data, error } = await supabase
                    .from("medications")
                    .select("*")
                    .range(from, to);

                if (error) throw error;

                return res.json({
                    page: pageNum,
                    limit: limitNum,
                    data,
                });
            }

        // Kalau page & limit tidak dikirim → ambil semua data tanpa pagination
            const { data, error } = await supabase
                .from("medications")
                .select("*");

            if (error) throw error;

            return res.json({ data });

        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },


    async getById(req, res) {
        try {
            const med = await MedicationModel.getById(req.params.id);
            res.json(med);
        } catch (err) {
            res.status(404).json({ error: err.message });
        }
    },

    async create(req, res) {
        try {
            const { price, quantity } = req.body;

            // Validasi input
            if (price !== undefined && quantity !== undefined) {
                if (price <= 0 || quantity <= 0) {
                    return res.status(400).json({
                        error: "Harga dan kuantitas tidak boleh kurang dari atau sama dengan nol.",
                    });
                }
            }

            const med = await MedicationModel.create(req.body);
            return res.status(201).json(med);
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },

    async update(req, res) {
        try {
            const { price, quantity } = req.body;

            // Validasi input
            if (price !== undefined && quantity !== undefined) {
                if (price <= 0 || quantity <= 0) {
                    return res.status(400).json({
                        error: "Harga dan kuantitas tidak boleh kurang dari atau sama dengan nol.",
                    });
                }
            }

            const med = await MedicationModel.update(req.params.id, req.body);
            if (!med) {
                return res.status(404).json({ error: "Obat tidak ditemukan" });
            }

            return res.json(med);
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    },


    async remove(req, res) {
        try {
            await MedicationModel.remove(req.params.id);
            res.json({ message: "Deleted successfully" });
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    },

    async getTotal(req, res) {
        try {
            const total = await MedicationModel.getTotal();
            res.json({ total });
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    },

    async search(req, res) {
        const { query } = req.query;
        if (!query) {
            return res.status(400).json({ error: "Search query parameter is required" });
        }
        try {
            const { data, error } = await supabase
                .from("medications")
                .select(`
                    id,
                    sku,
                    name,
                    description,
                    price,
                    quantity,
                    categories(id,name),
                    suppliers(id,name,email,phone)
                `)
                .ilike("name", `%${query}%`);
            if (error) {
                return res.status(400).json({ error: error.message });
            }

            if (!data || data.length === 0) {
                return res.status(404).json({ message: "No medications found" });
            }
            return res.json(data);
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }

};
