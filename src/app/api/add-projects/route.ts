import { NextResponse } from 'next/server';
import { db } from '../../../db/index';
import { project } from '../../../db/schema';
import nodemailer from 'nodemailer';

// Create a more resilient transporter
const createTransporter = () => {
  try {
    return nodemailer.createTransport({
      host: "mail.gdggtbit.in",
      port: 587,
      secure: false,
      auth: {
          user: 'gitfund@gdggtbit.in',
          pass: 'SagarTanav2003#@'
      }
    });
  } catch (error) {
    console.error('Failed to create email transporter:', error);
    // Return a mock transporter that logs instead of sending
    return {
      sendMail: async (options) => {
        console.log('Email would be sent:', options);
        return { accepted: [], rejected: [], messageId: 'mock-id' };
      }
    };
  }
};

const transporter = createTransporter();

export async function POST(request: Request) {
    try {
        const { email, projectName, comits, languages, contributors, aiDescription, projectOwner, shortdes, longdis, image_url, project_repository, stars, forks } = await request.json();
        console.log(stars, forks, "hello");
        
        // First insert the project
        try {
            await db.insert(project).values({
                projectName: projectName,
                contributors: contributors,
                aiDescription: aiDescription,
                projectOwner: projectOwner,
                shortdes: shortdes,
                longdis: longdis,
                image_url: image_url,
                project_repository: project_repository,
                languages: languages,
                stars: stars,
                forks: forks,
                comits: comits,
            });
        } catch (dbError) {
            console.error('Database error during project creation:', dbError);
            return NextResponse.json({ 
                success: false, 
                error: 'Failed to create project in database'
            }, { status: 500 });
        }

        // Then send email notification
        try {
            const info = await transporter.sendMail({
                from: 'gitfund@gdggtbit.in',
                to: email,
                subject: 'New Project Added on GitFund!',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h1 style="color: #333;">New Project: ${projectName}</h1>
                        <p><strong>Project Owner:</strong> ${projectOwner}</p>
                        <p><strong>Description:</strong> ${shortdes}</p>
                        <p><strong>Repository:</strong> ${project_repository}</p>
                        <hr>
                        <p>Visit GitFund to learn more and start contributing!</p>
                    </div>
                `
            });

            return NextResponse.json({ 
                success: true, 
                emailSent: info.accepted.length > 0,
                messageId: info.messageId 
            });

        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            // Return success true because project was created even if email failed
            return NextResponse.json({ 
                success: true, 
                emailSent: false,
                error: 'Project created but notification email failed'
            });
        }

    } catch (error) {
        console.error('Error in project creation:', error);
        return NextResponse.json({ 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

export async function GET() {
    try {
        // Add error handling for database operations
        try {
            const projectsData = await db.select().from(project);
            return NextResponse.json({ project: projectsData });
        } catch (dbError) {
            console.error('Database error fetching projects:', dbError);
            // Return empty array instead of failing
            return NextResponse.json({ project: [] });
        }
    } catch (error) {
        console.error('Error fetching projects:', error);
        return NextResponse.json({ error: 'Internal Server Error', project: [] }, { status: 500 });
    }
}