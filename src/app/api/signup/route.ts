import { NextResponse } from 'next/server';
import { db } from '../../../db/index';
import { users } from '../../../db/schema';
import nodemailer from 'nodemailer';
import {eq} from 'drizzle-orm';
import { idea } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { IdCard } from 'lucide-react';


export async function POST(request: Request) {
    try {
        const { id, email, fullName, metaMask, image_url, Location, Bio, Telegram, Twitter, Linkedin, skills, termsAccepted,formFilled } = await request.json();
        
        // Insert user into database
        await db.insert(users).values({
            id,
            email,
            fullName,
            image_url,
            metaMask,
            formFilled: formFilled || true, // Default to false if not provided
            Location: Location,
            Bio: Bio,
            Telegram: Telegram,
            Twitter: Twitter,
            Linkedin: Linkedin,
            skills: skills || undefined,
            termsAccepted: termsAccepted
        });

        return NextResponse.json({
            success: true,
            emailSent: false,
            message: 'User signed up successfully'
        });

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
        const { id, fullName, metaMask, Bio, Location, Telegram, Twitter, Linkedin, skills } = await request.json();
        
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
        if (Bio !== undefined) updateData.Bio = Bio;
        if (Location !== undefined) updateData.Location = Location;
        if (Telegram !== undefined) updateData.Telegram = Telegram;
        if (Twitter !== undefined) updateData.Twitter = Twitter;
        if (Linkedin !== undefined) updateData.Linkedin = Linkedin;
        if (skills !== undefined) updateData.skills = skills;
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
