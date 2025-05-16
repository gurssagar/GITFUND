import { NextResponse } from 'next/server';
import { db } from '../../../db/index';
import { projects } from '../../../db/schema';
import nodemailer from 'nodemailer';

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
        const { email, projectName,languages, priority, difficulty, rewardAmount, contributors, aiDescription, projectOwner, shortdes, longdis, image_url, project_repository, project_issues ,stars,forks} = await request.json();
        console.log(stars,forks,"hello")
        // First insert the project
        await db.insert(projects).values({
            contributors:contributors,
            aiDescription:aiDescription,
            projectOwner:projectOwner,
            projectName: projectName,
            shortdes: shortdes,
            longdis: longdis,
            image_url: image_url,
            project_repository: project_repository,
            project_issues:project_issues,
            Difficulty:difficulty,
            rewardAmount:rewardAmount,
            priority:priority,
            languages:languages,
            stars:stars,
            forks:forks
        });

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

export async function GET() {
    try {
        const projectsData = await db.select().from(projects);
        return NextResponse.json({ projects: projectsData });
    } catch (error) {
        console.error('Error fetching projects:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}