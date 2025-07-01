import { NextResponse } from 'next/server';
import { db } from '../../../db/index';
import { issues } from '../../../db/schema';
import nodemailer from 'nodemailer';
import { eq } from 'drizzle-orm';
const transporter = nodemailer.createTransport({
    host: "mail.gdggtbit.in",
    port: 587,
    secure: false,
    auth: {
        user: 'gitfund@gdggtbit.in',
        pass: 'SagarTanav2003#@'
    }
});

export async function POST(request: Request) {
    try {
        const { email, priority,issue_name,issue_description,issue_date,project_repository, difficulty, rewardAmount,project_issues } = await request.json();
        // First insert the project
        await db.insert(issues).values({
            issue_name: issue_name,
            issue_description: issue_description,
            issue_date: issue_date,
            project_repository: project_repository,
            project_issues:project_issues,
            Difficulty:difficulty,
            rewardAmount:rewardAmount,
            priority:priority,
            
        });

        // Then send email notification
        try {
            const info = await transporter.sendMail({
                from: 'gitfund@gdggtbit.in',
                to: email,
                subject: 'New Project Added on GitFund!',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <p><strong>Difficulty:</strong> ${difficulty}</p>
                        <p><strong>Reward Amount:</strong> ${rewardAmount} PAHROS</p>
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

export async function GET(request:Request) {
    const url = new URL(request.url);
    const project_repository = url.searchParams.get('project_repository');

    if (!project_repository) {
        return NextResponse.json({ error: 'project_repository is required' }, { status: 400 });
    }

    try {
        const projectsData = await db.select().from(issues).where(eq(issues.project_repository, project_repository)).orderBy(issues.priority);
        return NextResponse.json({ projects: projectsData });
    } catch (error) {
        console.error('Error fetching projects:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}