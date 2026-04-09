-- ==========================================
-- NEXUS MARKET INTELLIGENCE: LEADS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS nexus_market_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  text TEXT NOT NULL,
  source TEXT NOT NULL,
  target_competitor TEXT,
  sentiment TEXT DEFAULT 'neutral',
  status TEXT DEFAULT 'raw', -- raw, reviewed, dispatched, ignored
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE nexus_market_leads ENABLE ROW LEVEL SECURITY;

-- Only authenticated admins can view/manage leads
CREATE POLICY "Admins can manage market leads" 
  ON nexus_market_leads 
  FOR ALL 
  TO authenticated 
  USING (auth.jwt() ->> 'role' = 'admin');

COMMENT ON TABLE nexus_market_leads IS 'Stores market intelligence gathered by the Market Dispatcher agents.';
