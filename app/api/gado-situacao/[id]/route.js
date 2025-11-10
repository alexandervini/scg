import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL = "https://zvgehtwivjrtlplyjqbu.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2Z2VodHdpdmpydGxwbHlqcWJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3MzU4NDIsImV4cCI6MjA3ODMxMTg0Mn0.Pju7Jajk9yOebZSaZLmJGHVvGv_u89zAOPBzP4br0hA";
const supabase = createClient(supabaseUrl, supabaseKey);

// PUT - Atualizar uma condição de gado
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const { gado_id, condicao } = await request.json();

    if (!gado_id || !condicao) {
      return NextResponse.json(
        { error: 'O gado e a condição são obrigatórios.' },
        { status: 400 }
      );
    }

    // Atualizar a condição
    const { error: updateError } = await supabase
      .from('gado_condicao')
      .update({ gado_id, condicao })
      .eq('id', id);

    if (updateError) throw updateError;

    // Buscar a condição atualizada com os dados completos
    const { data: fullData, error: fullError } = await supabase
      .from('gado_condicao')
      .select(`
        *,
        gado:gado_id (
          identificacao
        )
      `)
      .eq('id', id)
      .single();

    if (fullError) throw fullError;

    // Formatar os dados
    const formattedData = {
      ...fullData,
      gado_identificacao: fullData.gado?.identificacao
    };

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error('Erro ao atualizar condição:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Deletar uma condição de gado
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    const { error } = await supabase
      .from('gado_condicao')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Condição deletada com sucesso.' });
  } catch (error) {
    console.error('Erro ao deletar condição:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}