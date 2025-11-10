// app/api/gado-vacinas/route.js
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zvgehtwivjrtlplyjqbu.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2Z2VodHdpdmpydGxwbHlqcWJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3MzU4NDIsImV4cCI6MjA3ODMxMTg0Mn0.Pju7Jajk9yOebZSaZLmJGHVvGv_u89zAOPBzP4br0hA";
const supabase = createClient(supabaseUrl, supabaseKey);

// GET - Listar todos os registros de vacinação
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('gado_vacinas')
      .select(`
        id,
        gado_id,
        vacina_id,
        data_aplicacao,
        data_validade,
        status,
        gado:gado_id (
          identificacao
        ),
        vacinas:vacina_id (
          nome,
          periodicidade_dias,
          tem_reforco,
          dias_reforco
        )
      `)
      .order('data_aplicacao', { ascending: false });

    if (error) throw error;

    // Formatar os dados para manter compatibilidade com o formato anterior
    const formattedData = data.map(item => ({
      id: item.id,
      gado_id: item.gado_id,
      vacina_id: item.vacina_id,
      data_aplicacao: item.data_aplicacao,
      data_validade: item.data_validade,
      status: item.status,
      gado_identificacao: item.gado?.identificacao || null,
      vacina_nome: item.vacinas?.nome || null,
      periodicidade_dias: item.vacinas?.periodicidade_dias || null,
      tem_reforco: item.vacinas?.tem_reforco || null,
      dias_reforco: item.vacinas?.dias_reforco || null
    }));

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error('Erro ao listar vacinações:', error);
    return NextResponse.json({ error: 'Erro ao listar vacinações' }, { status: 500 });
  }
}

// POST - Registrar nova vacinação
export async function POST(request) {
  try {
    const body = await request.json();
    const { gado_id, vacina_id, data_aplicacao, data_validade, status } = body;

    // Validação dos campos obrigatórios
    if (!gado_id || !vacina_id || !data_aplicacao) {
      return NextResponse.json({ 
        error: 'Gado, vacina e data de aplicação são obrigatórios' 
      }, { status: 400 });
    }

    // Inserir o novo registro
    const { data, error } = await supabase
      .from('gado_vacinas')
      .insert([{
        gado_id,
        vacina_id,
        data_aplicacao,
        data_validade: data_validade || null,
        status: status || 'aplicada'
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Erro ao registrar vacinação:', error);
    return NextResponse.json({ error: 'Erro ao registrar vacinação' }, { status: 500 });
  }
}