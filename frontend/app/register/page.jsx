'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../lib/authStore';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { useToast } from '../../components/ui/use-toast';

export default function RegisterPage() {
    const [formData, setFormData] = useState({ username: '', email: '', password: '', role: 'volunteer', phone: '' });
    const [loading, setLoading] = useState(false);
    const { login } = useAuthStore();
    const router = useRouter();
    const { toast } = useToast();

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        let body = { ...formData };
        if (body.role === 'volunteer') {
            body.volunteerData = {
                name: body.username,
                email: body.email,
                phone: body.phone || '000-000-0000',
            };
        }

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000'}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Registration failed');

            login(data);
            toast({ title: "Registration Successful", description: `Welcome context added for ${data.username}` });

            if (data.role === 'admin') router.push('/');
            else router.push('/volunteer-portal');

        } catch (err) {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen w-full items-center justify-center p-4">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">Sign Up</CardTitle>
                    <CardDescription>Create an account to join the force.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input id="username" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required />
                        </div>
                        <div className="space-y-2">
                            <Label>Role</Label>
                            <Select defaultValue="volunteer" onValueChange={val => setFormData({ ...formData, role: val })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="volunteer">Volunteer</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {formData.role === 'volunteer' && (
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input id="phone" type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} required />
                            </div>
                        )}
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Registering...' : 'Sign Up'}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center text-sm">
                    <p>Already have an account? <a href="/login" className="text-blue-500 hover:underline">Log in</a></p>
                </CardFooter>
            </Card>
        </div>
    );
}
