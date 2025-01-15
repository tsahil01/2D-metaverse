import { BACKEND_URL } from '@/lib/config';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';

interface AvatarOption {
    id: string;
    imageUrl: string;
}

export function Avatar() {
    const [token, setToken] = useState<string | null>(null);
    const [avatarUrl, setAvatarUrl] = useState("");
    const [avatarOptions, setAvatarOptions] = useState<AvatarOption[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        if (storedToken) {
            setToken(storedToken);
            getAvatar(storedToken);
            getAllAvatars(storedToken);
        } else {
            window.location.href = "/login";
        }
    }, []);

    async function getAvatar(authToken: string) {
        const res = await fetch(`${BACKEND_URL}/user/metadata`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`
            }
        });
        const data = await res.json();
        console.log(data);
        if (data.avatarUrl) {
            setAvatarUrl(data.avatarUrl);
        }
    }

    async function getAllAvatars(authToken: string) {
        const res = await fetch(`${BACKEND_URL}/avatars`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`
            }
        });
        const data = await res.json();
        console.log(data);
        setAvatarOptions(data.avatars);
    }

    async function updateAvatar(avatar: AvatarOption) {
        if (!token) return;

        const res = await fetch(`${BACKEND_URL}/user/metadata`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ avatarId: avatar.id })
        });

        if (res.ok) {
            setAvatarUrl(avatar.imageUrl);
            setIsDialogOpen(false);
        } else {
            console.error("Failed to update avatar");
        }
    }

    return (
        <Card className='mt-9'>
            <CardHeader className='bg-primary/5'>
                <CardTitle>Avatar</CardTitle>
                <CardDescription>
                    Here you can customize your avatar and view your profile.
                </CardDescription>
            </CardHeader>
            <CardContent className='mt-4'>
                <div className="flex flex-col items-center">
                    {avatarUrl && (
                        <div
                            className="w-full h-32 bg-no-repeat bg-cover mb-2"
                            style={{
                                backgroundImage: `url(${avatarUrl || "https://via.placeholder.com/150"})`,
                                backgroundPosition: '32 0',
                                backgroundSize: 'cover',
                            }}
                        ></div>
                    )}
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="default">
                                {avatarUrl ? "Change Avatar" : "Set Avatar"}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Choose an Avatar</DialogTitle>
                            </DialogHeader>
                            <div className="grid grid-cols-4 gap-4 py-4">
                                {avatarOptions.map((avatar) => (
                                    <div
                                        className="w-full h-24 bg-no-repeat bg-cover mb-2 border border-gray-800 rounded cursor-pointer"
                                        style={{
                                            backgroundImage: `url(${avatar.imageUrl || "https://via.placeholder.com/150"})`,
                                            backgroundPosition: '32 0',
                                            backgroundSize: 'cover',
                                        }}
                                        onClick={() => updateAvatar(avatar)}
                                    ></div>
                                ))}
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardContent>
        </Card>
    )
}

