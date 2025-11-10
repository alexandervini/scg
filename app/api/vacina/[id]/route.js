import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Configuração do Supabase (use variáveis de ambiente no seu projeto real)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zvgehtwivjrtlplyjqbu.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2Z2VodHdpdmpydGxwbHlqcWJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3MzU4NDIsImV4cCI6MjA3ODMxMTg0Mn0.Pju7Jajk9yOebZSaZLmJGHVvGv_u89zAOPBzP4br0hA";
const supabase = createClient(supabaseUrl, supabaseKey);

// PUT - Atualizar vacina pelo NOME
// Este arquivo deve estar em: app/api/vacinas/[nomeVacina]/route.js
export async function PUT(request, { params }) {
  try {
    // O Next.js App Router passa o parâmetro de rota (ex: [nomeVacina]) em params
    const { id } = params; 
    const nomeAntigo = decodeURIComponent(id);
    const data = await request.json();
    const { nome, periodicidade_dias } = data;

    if (!nome) {
      return NextResponse.json({ error: 'O nome da vacina é obrigatório' }, { status: 400 });
    }
    
    // Adaptação para Supabase
    const { data: updatedVacina, error: updateError } = await supabase
      .from('vacinas')
      .update({ 
        nome: nome, 
        periodicidade_dias: periodicidade_dias || null 
      })
      .eq('nome', nomeAntigo)
      .select() // Adiciona .select() para retornar os dados atualizados
      .single(); // Espera um único registro

    if (updateError) {
      throw updateError;
    }
    
    if (!updatedVacina) {
      return NextResponse.json({ error: 'Vacina não encontrada' }, { status: 404 });
    }
    
    return NextResponse.json(updatedVacina);
  } catch (error) {
    console.error('Erro ao atualizar vacina:', error);
    // O Supabase retorna um objeto de erro, mas para o usuário final, 
    // é melhor retornar uma mensagem genérica de erro interno.
    return NextResponse.json({ error: 'Erro interno do servidor ao atualizar vacina' }, { status: 500 });
  }
}

// DELETE - Deletar vacina pelo NOME
// Este arquivo deve estar em: app/api/vacinas/[nomeVacina]/route.js
export async function DELETE(request, { params }) {
  try {
    const { id } = params; 
    const nomeVacina = decodeURIComponent(id);
    
    // Adaptação para Supabase: Primeiro, verifica se a vacina existe para retornar 404 se não existir
    const { data: existingVacina, error: selectError } = await supabase
      .from('vacinas')
      .select('nome')
      .eq('nome', nomeVacina)
      .single();

    if (selectError && selectError.code !== 'PGRST116') { // PGRST116 é "No rows found"
        throw selectError;
    }

    if (!existingVacina) {
        return NextResponse.json({ error: 'Vacina não encontrada' }, { status: 404 });
    }

    // Deleta a vacina
    const { error: deleteError } = await supabase
      .from('vacinas')
      .delete()
      .eq('nome', nomeVacina);

    if (deleteError) {
      throw deleteError;
    }
    
    return NextResponse.json({ message: 'Vacina deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar vacina:', error);
    return NextResponse.json({ error: 'Erro interno do servidor ao deletar vacina' }, { status: 500 });
  }
}
