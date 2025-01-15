import { BACKEND_URL } from '@/lib/config';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { useEffect, useState } from 'react';

export function Spaces() {

    return (
        <Card className='mt-9 w-full'>
        <CardHeader className='bg-primary/5'>
            <CardTitle>Your Spaces</CardTitle>
            <CardDescription>
                Here are the virtual spaces you have created. You can create new spaces and manage them here.
            </CardDescription>
        </CardHeader>
    </Card>
    )
}