import { NextResponse } from 'next/server';
import { db } from '../../../db/index';
import { users } from '../../../db/schema';
import nodemailer from 'nodemailer';
import {eq} from 'drizzle-orm';
import { idea } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { IdCard } from 'lucide-react';

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
        const { id, email, name, walletAddress,image_url } = await request.json();
        
        // Insert user into database
        await db.insert(users).values({
            id: id,
            email: email,
            fullName: name,
            image_url:image_url,
            metaMask: walletAddress,
        });

        // Send and verify email
        try {
            const info = await transporter.sendMail({
                from: 'gitfund@gdggtbit.in',
                to: email,
                subject: 'Welcome to GitFund!',
                html: `
                    <h1>Welcome to GitFund, ${name}!</h1>
                    <p>Thank you for joining our platform. Your account has been successfully created.</p>
                    <p>Your wallet address: ${walletAddress}</p>
                    <p>Start exploring projects and contributing today!</p>
                `
            });

            if (info.accepted.length > 0) {
                console.log('Email sent successfully:', info.messageId);
                return NextResponse.json({ 
                    success: true, 
                    emailSent: true,
                    messageId: info.messageId 
                });
            } else {
                console.error('Email not accepted by recipient');
                return NextResponse.json({ 
                    success: true, 
                    emailSent: false,
                    error: 'Email not accepted by recipient' 
                });
            }
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            return NextResponse.json({ 
                success: true, 
                emailSent: false,
                error: 'Failed to send welcome email' 
            });
        }

    } catch (error) {
        console.error('Error in signup process:', error);
        return NextResponse.json({ 
            success: false, 
            emailSent: false,
            error: error instanceof Error ? error.message : 'Unknown error' 
        }, { status: 500 });
    }
}

export async function GET() {
    try {
        const usersData = await db.select().from(users);
        return NextResponse.json({ users: usersData });
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const { id, fullName, metaMask, bio, linkedin, twitter, location, telegram } = await request.json();
        
        if (!id) {
            return NextResponse.json({ 
                success: false, 
                error: 'User ID is required' 
            }, { status: 400 });
        }
        
        // Prepare update object with only provided fields
        const updateData: Record<string, any> = {};
        
        if (fullName !== undefined) updateData.fullName = fullName;
        if (metaMask !== undefined) updateData.metaMask = metaMask;
        if (bio !== undefined) updateData.Bio = bio;
        if (linkedin !== undefined) updateData.Linkedin = linkedin;
        if (twitter !== undefined) updateData.Twitter = twitter;
        if (location !== undefined) updateData.Location = location;
        if (telegram !== undefined) updateData.Telegram = telegram;
        console.log('Update data:', updateData);
        console.log(id)
        // If no fields to update, return early
        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ 
                success: false, 
                error: 'No fields to update' 
            }, { status: 400 });
        }
        console.log(await db.select().from(users).where(eq(users.id, id)));

        // Update user in database
        const result = await db
            .update(users)
            .set(updateData)
            .where(eq(users.id, id))
            .returning();
        
        console.log('Update result:', result);
        // Check if user was found and updated
        if (!result) {
            return NextResponse.json({ 
                success: false, 
                error: 'User not found' 
            }, { status: 404 });
        }
        
        return NextResponse.json({ 
            success: true, 
            message: 'User profile updated successfully' 
        });
    }
    catch(error) {
        console.error('Error updating user profile:', error);
        return NextResponse.json({ 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error' 
        }, { status: 500 });
    }
}
