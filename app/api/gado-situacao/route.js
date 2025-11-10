import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL = "https://zvgehtwivjrtlplyjqbu.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2Z2VodHdpdmpydGxwbHlqcWJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3MzU4NDIsImV4cCI6MjA3ODMxMTg0Mn0.Pju7Jajk9yOebZSaZLmJGHVvGv_u89zAOPBzP4br0hA";
const supabase = createClient(supabaseUrl, supabaseKey);

// GET - Listar todas as condições de gado
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('gado_condicao')
      .select(`
        id,
        gado_id,
        condicao,
        gado:gado_id (
          identificacao
        )
      `)
      .order('id', { ascending: false });

    if (error) throw error;

    // Formatar os dados para manter a estrutura original
    const formattedData = data.map(item => ({
      id: item.id,
      gado_id: item.gado_id,
      condicao: item.condicao,
      gado_identificacao: item.gado?.identificacao
    }));

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error('Erro ao listar condições:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// POST - Registrar nova condição de gado
export async function POST(request) {
  try {
    const { gado_id, condicao } = await request.json();

    if (!gado_id || !condicao) {
      return NextResponse.json(
        { error: 'O gado e a condição são obrigatórios.' },
        { status: 400 }
      );
    }

    // Verificar se o gado já tem uma condição
    const { data: existing, error: checkError } = await supabase
      .from('gado_condicao')
      .select('id')
      .eq('gado_id', gado_id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: 'Este gado já possui uma condição registrada. Edite a existente.' },
        { status: 409 }
      );
    }

    // Inserir nova condição
    const { data, error } = await supabase
      .from('gado_condicao')
      .insert([{ gado_id, condicao }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Erro ao registrar condição:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}