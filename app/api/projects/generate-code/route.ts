import { NextRequest, NextResponse } from 'next/server';

// FlowSurf.AI style PRD + Code generation endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      nodeId,
      nodeTitle,
      nodeDescription,
      nodeType,
      projectContext,
      codeOptions
    } = body;

    // Validation
    if (!nodeTitle || !nodeDescription) {
      return NextResponse.json(
        {
          success: false,
          error: 'Node title and description are required'
        },
        { status: 400 }
      );
    }

    console.log('🚀 Frontend API: Generating code for node:', nodeTitle);
    console.log('📋 Project context:', projectContext?.name || 'Unknown');
    console.log('⚙️ Code options:', JSON.stringify(codeOptions, null, 2));

    // Call the enhanced FlowSprint backend with node-code endpoint
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    const response = await fetch(`${backendUrl}/api/ai/node-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nodeId,
        nodeTitle,
        nodeDescription,
        nodeType: nodeType || 'component',
        projectContext: {
          name: projectContext?.name || 'Web Application',
          description: projectContext?.description || '',
          features: projectContext?.features || {},
          techStack: projectContext?.techStack || ['React', 'TypeScript', 'Next.js', 'Tailwind CSS'],
          complexity: projectContext?.complexity || 'medium'
        },
        codeOptions: {
          framework: codeOptions?.framework || 'nextjs',
          language: codeOptions?.language || 'typescript',
          styling: codeOptions?.styling || 'tailwind',
          includeTests: codeOptions?.includeTests || false,
          includeComments: codeOptions?.includeComments || true
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Backend error:', errorData);
      
      return NextResponse.json(
        {
          success: false,
          error: errorData.error || errorData.message || 'Backend request failed',
          details: errorData.details || 'Unknown backend error'
        },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log('✅ Backend response received:', {
      success: result.success,
      filesGenerated: result.data?.files?.length || 0,
      provider: result.metadata?.provider,
      responseTime: result.metadata?.responseTime
    });

    // Validate the response structure
    if (!result.success || !result.data || !result.data.files) {
      console.error('❌ Invalid backend response structure:', result);
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid response from backend',
          details: 'Backend did not return expected file structure'
        },
        { status: 500 }
      );
    }

    // Log file details for debugging
    result.data.files.forEach((file: any, index: number) => {
      console.log(`📄 File ${index + 1}: ${file.name}`);
      console.log(`   Type: ${file.type}, Language: ${file.language}`);
      console.log(`   PRD: ${file.prd ? 'Yes' : 'No'}, Code Lines: ${file.content?.split('\n').length || 0}`);
    });

    // Return the structured response in FlowSurf.AI format
    return NextResponse.json({
      success: true,
      data: {
        files: result.data.files.map((file: any) => ({
          name: file.name,
          path: file.path,
          content: file.content,
          language: file.language,
          type: file.type,
          description: file.description,
          prd: file.prd // Include PRD for FlowSurf.AI compatibility
        })),
        summary: result.data.summary,
        instructions: result.data.instructions,
        dependencies: result.data.dependencies,
        nodeId,
        nodeTitle,
        nodeType
      },
      metadata: {
        provider: result.metadata?.provider,
        responseTime: result.metadata?.responseTime,
        filesGenerated: result.data.files.length,
        totalLines: result.data.files.reduce((sum: number, file: any) => 
          sum + (file.content?.split('\n').length || 0), 0),
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Frontend API Error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}