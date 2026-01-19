import { NextRequest, NextResponse } from 'next/server';

// Simple intent detection for search
function shouldSearch(query: string): boolean {
  const lower = query.toLowerCase();

  // Check for question words + context
  const questionWords = ['what', 'when', 'where', 'who', 'how', 'why', 'which', 'is', 'are', 'was', 'were'];
  const hasQuestionWord = questionWords.some(w => lower.startsWith(w + ' ') || lower.includes(' ' + w + ' '));

  // Check for specific contexts that need real-time data
  const realTimeContexts = [
    'weather', 'temperature', 'forecast',
    'stock', 'price', 'ticker',
    'news', 'latest', 'current',
    'time', 'date', 'now',
    'today', 'tomorrow', 'yesterday',
    'exchange rate', 'currency',
    'sports', 'score', 'game',
    'traffic', 'route', 'direction',
  ];

  const hasRealTimeContext = realTimeContexts.some(ctx => lower.includes(ctx));

  return hasQuestionWord || hasRealTimeContext;
}

// Format search results
function formatSearchResults(results: Array<{ title?: string; snippet?: string; content?: string; url?: string }>): string {
  if (!results || results.length === 0) {
    return 'No search results found.';
  }

  return results
    .slice(0, 3)
    .map((r, i) => {
      const title = r.title || 'Untitled';
      const snippet = r.snippet || r.content?.substring(0, 200) || '';
      const url = r.url || '';
      return `${i + 1}. ${title}\n   ${snippet}\n   ${url}`;
    })
    .join('\n\n');
}

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // Check if we should actually search
    if (!shouldSearch(query)) {
      return NextResponse.json({
        success: true,
        should_search: false,
        message: 'Query does not require real-time search',
      });
    }

    // Try Tavily search
    const tavilyKey = process.env.TAVILY_API_KEY;

    if (!tavilyKey) {
      return NextResponse.json({
        success: false,
        error: 'TAVILY_API_KEY not configured',
      }, { status: 500 });
    }

    const tavilyResponse = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: tavilyKey,
        query: query,
        max_results: 3,
        search_depth: 'basic',
      }),
    });

    if (!tavilyResponse.ok) {
      throw new Error(`Tavily API error: ${tavilyResponse.status}`);
    }

    const data = await tavilyResponse.json();
    const formatted = formatSearchResults(data.results || []);

    return NextResponse.json({
      success: true,
      should_search: true,
      results: formatted,
      raw_results: data.results,
    });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
