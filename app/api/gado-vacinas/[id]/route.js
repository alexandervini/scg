// app/api/gado-vacinas/[id]/route.js
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zvgehtwivjrtlplyjqbu.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2Z2VodHdpdmpydGxwbHlqcWJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3MzU4NDIsImV4cCI6MjA3ODMxMTg0Mn0.Pju7Jajk9yOebZSaZLmJGHVvGv_u89zAOPBzP4br0hA";
const supabase = createClient(supabaseUrl, supabaseKey);

// PUT - Atualizar registro de vacinação
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { gado_id, vacina_id, data_aplicacao, data_validade, status } = body;

    // Validação dos campos obrigatórios
    if (!gado_id || !vacina_id || !data_aplicacao) {
      return NextResponse.json({ 
        error: 'Gado, vacina e data de aplicação são obrigatórios' 
      }, { status: 400 });
    }

    // Atualizar o registro
    const { data, error } = await supabase
      .from('gado_vacinas')
      .update({
        gado_id,
        vacina_id,
        data_aplicacao,
        data_validade: data_validade || null,
        status: status || 'aplicada'
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      // Se não encontrou o registro
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Registro não encontrado' }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao atualizar vacinação:', error);
    return NextResponse.json({ error: 'Erro ao atualizar vacinação' }, { status: 500 });
  }
}

// DELETE - Deletar registro de vacinação
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    const { data, error } = await supabase
      .from('gado_vacinas')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) {
      // Se não encontrou o registro
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Registro não encontrado' }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ message: 'Vacinação deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar vacinação:', error);
    return NextResponse.json({ error: 'Erro ao deletar vacinação' }, { status: 500 });
  }
}