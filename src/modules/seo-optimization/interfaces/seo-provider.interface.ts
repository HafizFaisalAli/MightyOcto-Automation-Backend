/**
 * SEO Provider Interface
 * Abstraction for different SEO tools (Semrush, SERPAPI, Moz)
 */

export interface SEOKeywordData {
  keyword: string;
  searchVolume: number;
  difficulty: number;
  cpc: number;
  competition: string;
  trend: string;
}

export interface SEOContentAnalysis {
  score: number;
  keywordDensity: number;
  readability: number;
  recommendations: string[];
  competitorUrls?: string[];
}

export interface ISEOProvider {
  /**
   * Get keyword research data
   */
  getKeywordData(keyword: string): Promise<SEOKeywordData>;

  /**
   * Analyze content for SEO optimization
   */
  analyzeContent(content: string, keyword: string): Promise<SEOContentAnalysis>;

  /**
   * Get keyword suggestions
   */
  getKeywordSuggestions(seed: string): Promise<string[]>;

  /**
   * Get competitor analysis
   */
  getCompetitorAnalysis(keyword: string): Promise<any>;
}
