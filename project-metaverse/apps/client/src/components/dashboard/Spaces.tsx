import { BACKEND_URL } from '@/lib/config';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { useEffect, useState } from 'react';
import { SpaceCardProps } from '@/lib/types';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';

export function Spaces() {
    const navigate = useNavigate();

    const [spaces, setSpaces] = useState<SpaceCardProps[]>([]);

    async function fetchSpaces() {
        const token = localStorage.getItem("token");
        if (!token) return;
        const data = await fetch(`${BACKEND_URL}/space/all`, {
            method: "GET",
            headers: {
                contentType: "application/json",
                Authorization: `Bearer ${token}`
            }
        });

        const jsonData = await data.json();
        console.log(jsonData);
        setSpaces(jsonData.spaces);
    }

    useEffect(() => {
        fetchSpaces();
    }, []);

    return (
        <Card className='mt-9 w-full'>
            <CardHeader className='bg-primary/5 flex flex-row justify-between'>
                <div>
                    <CardTitle>Your Spaces</CardTitle>
                    <CardDescription>
                        Here are the virtual spaces you have created. You can create new spaces and manage them here.
                    </CardDescription>
                </div>
                <Button
                    onClick={() => navigate('/new-space')}
                >Create New Space</Button>
            </CardHeader>
            <CardContent className='mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                {
                    spaces.length == 0 && (
                        <div className='text-center col-span-3 h-full border-2 border-dashed border-primary-50 rounded-lg p-4'>
                            <h2 className='text-primary-50'>
                                You have not created any spaces yet.
                            </h2>
                        </div>
                    )
                }
                {spaces.map(space => <SpaceCard key={space.id} {...space} />)}
            </CardContent>
        </Card>
    )
}


function SpaceCard({ ...props }: SpaceCardProps) {
    const navigate = useNavigate();
    return (
        <Card className='shadow-lg rounded-lg p-4' key={props.id}>
            <CardHeader>
                <img src={props.thumbnail || ""} alt={props.id} />
            </CardHeader>
            <CardContent>
                <CardTitle>{props.name}</CardTitle>
                <CardDescription>
                    {props.width}x{props.height}
                </CardDescription>
            </CardContent>
            <CardFooter className='flex flex-row justify-between'>
                <Button
                    onClick={() => navigate(`/space/${props.id}`)}
                >Open</Button>
                <Button>Delete</Button>
            </CardFooter>
        </Card>
    )
}