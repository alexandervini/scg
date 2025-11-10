import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Configuração do Supabase (use variáveis de ambiente no seu projeto real)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zvgehtwivjrtlplyjqbu.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2Z2VodHdpdmpydGxwbHlqcWJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3MzU4NDIsImV4cCI6MjA3ODMxMTg0Mn0.Pju7Jajk9yOebZSaZLmJGHVvGv_u89zAOPBzP4br0hA";
const supabase = createClient(supabaseUrl, supabaseKey);

// GET - Listar todas as vacinas
// Este arquivo deve estar em: app/api/vacinas/route.js
export async function GET() {
    try {
        const { data: vacinas, error } = await supabase
            .from('vacinas')
            .select('*');

        if (error) throw error;

        return NextResponse.json(vacinas);
    } catch (error) {
        console.error('Erro ao buscar vacinas:', error);
        return NextResponse.json({ error: 'Erro interno do servidor ao buscar vacinas' }, { status: 500 });
    }
}

// POST - Criar nova vacina
// Este arquivo deve estar em: app/api/vacinas/route.js
export async function POST(request) {
    try {
        const data = await request.json();
        const { nome, periodicidade_dias } = data;

        if (!nome) {
            return NextResponse.json({ error: 'O nome da vacina é obrigatório' }, { status: 400 });
        }

        const { data: newVacina, error } = await supabase
            .from('vacinas')
            .insert([
                { nome, periodicidade_dias: periodicidade_dias || null }
            ])
            .select()
            .single();

        if (error) {
            // Tratar erro de chave primária/única duplicada (código 23505 do PostgreSQL)
            if (error.code === '23505') {
                return NextResponse.json({ error: 'Já existe uma vacina com esse nome' }, { status: 400 });
            }
            throw error;
        }

        return NextResponse.json(newVacina, { status: 201 });
    } catch (error) {
        console.error('Erro ao criar vacina:', error);
        return NextResponse.json({ error: 'Erro interno do servidor ao criar vacina' }, { status: 500 });
    }
}
