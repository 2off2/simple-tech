-- Add user_id column to link transactions to users
ALTER TABLE public.transacoes 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Enable Row Level Security on the transacoes table
ALTER TABLE public.transacoes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies to ensure users can only access their own transactions
CREATE POLICY "Users can view their own transactions" 
ON public.transacoes 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions" 
ON public.transacoes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions" 
ON public.transacoes 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions" 
ON public.transacoes 
FOR DELETE 
USING (auth.uid() = user_id);