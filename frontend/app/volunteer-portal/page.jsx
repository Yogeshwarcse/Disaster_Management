'use client';
import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { useAuthStore } from '@/lib/authStore';
import { AppHeader } from '@/components/app-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Truck, Package, Clock, LogOut, CheckCircle, Bell, RefreshCw, Edit2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

export default function VolunteerPortal() {
    const { user, logout } = useAuthStore();
    const init = useStore(state => state.init);
    const centers = useStore(state => state.centers);
    const inventory = useStore(state => state.inventory);
    const dispatches = useStore(state => state.dispatches);
    const createDispatch = useStore(state => state.createDispatch);
    const updateDispatchStatus = useStore(state => state.updateDispatchStatus);

    const [selectedCenterId, setSelectedCenterId] = useState('');
    const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
    const [requestItems, setRequestItems] = useState([]);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editInventoryItems, setEditInventoryItems] = useState([]);

    useEffect(() => {
        init();
    }, []);

    useEffect(() => {
        if (centers.length > 0 && !selectedCenterId) {
            setSelectedCenterId(centers[0].id);
        }
    }, [centers]);

    const selectedCenter = centers.find(c => c.id === selectedCenterId);
    const centerDispatches = dispatches.filter(d => d.centerId === selectedCenterId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const centerLocalInventory = selectedCenter?.inventory || [];

    const updateCenterInventory = useStore(state => state.updateCenterInventory);

    const handleOpenEditDialog = () => {
        if (!selectedCenter) return;
        // Make sure the volunteer can see all required resources as 0 if they don't have them yet!
        const editableList = (selectedCenter.requiredResources || []).map(req => {
            const existing = centerLocalInventory.find(i => i.itemId === req.itemId);
            const globalLookup = inventory.find(g => g.id === req.itemId);
            return {
                itemId: req.itemId,
                itemName: existing ? existing.itemName : (globalLookup ? globalLookup.name : req.itemId),
                quantity: existing ? existing.quantity : 0
            };
        });

        // Add any unexpected items that somehow made it to the inventory
        centerLocalInventory.forEach(exist => {
            if (!editableList.find(c => c.itemId === exist.itemId)) {
                editableList.push({ ...exist });
            }
        });

        setEditInventoryItems(editableList);
        setIsEditDialogOpen(true);
    };

    const handleSaveInventory = async () => {
        if (!selectedCenterId) return;
        // Ensure we only save items that actually have quantity >= 0, drop the logic completely if you want, but they can be 0.
        await updateCenterInventory(selectedCenterId, editInventoryItems);
        setIsEditDialogOpen(false);
    };

    const handleEditItemQuantity = (itemId, quantity) => {
        setEditInventoryItems(prev => prev.map(i => i.itemId === itemId ? { ...i, quantity: Math.max(0, quantity) } : i));
    };

    const handleRequestResource = () => {
        if (!selectedCenterId || requestItems.length === 0) return;
        createDispatch(selectedCenterId, requestItems.map(i => ({ itemId: i.itemId, quantity: i.quantity })));
        setIsRequestDialogOpen(false);
        setRequestItems([]);
    };

    const toggleItem = (itemId, maxQuantity) => {
        setRequestItems((prev) => {
            const existing = prev.find((i) => i.itemId === itemId);
            if (existing) return prev.filter((i) => i.itemId !== itemId);
            return [...prev, { itemId, quantity: Math.min(10, maxQuantity) }];
        });
    };

    const updateItemQuantity = (itemId, quantity) => {
        setRequestItems((prev) =>
            prev.map((i) => i.itemId === itemId ? { ...i, quantity } : i)
        );
    };

    return (
        <div className="min-h-screen bg-background">
            <header className="sticky top-0 z-50 w-full border-b backdrop-blur-md bg-background/80">
                <div className="flex h-16 items-center px-6 justify-between">
                    <div className="flex flex-col">
                        <h1 className="text-xl font-bold">Volunteer Portal</h1>
                        <span className="text-xs text-muted-foreground">Logged in as {user?.username}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => init()}>
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" onClick={() => logout()}>
                            <LogOut className="mr-2 h-4 w-4" /> Logout
                        </Button>
                    </div>
                </div>
            </header>

            <main className="p-6 max-w-5xl mx-auto space-y-6">
                {centers.length === 0 ? (
                    <Card className="p-12 text-center">
                        <h2 className="text-xl font-semibold mb-2">No Centers Assigned</h2>
                        <p className="text-muted-foreground">You currently do not have access to any relief centers. Please contact your administrator.</p>
                    </Card>
                ) : (
                    <>
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                            <div className="relative w-full sm:w-64">
                                <Select value={selectedCenterId} onValueChange={setSelectedCenterId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Center" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {centers.map(center => (
                                            <SelectItem key={center.id} value={center.id}>{center.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button onClick={() => setIsRequestDialogOpen(true)} className="w-full sm:w-auto">
                                <Package className="mr-2 h-4 w-4" /> Request Resources
                            </Button>
                        </div>

                        {selectedCenter && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <Card className="md:col-span-1 border-primary/20 bg-primary/5">
                                    <CardHeader>
                                        <CardTitle className="text-lg">Center Overview</CardTitle>
                                        <CardDescription>{selectedCenter.name}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex justify-between border-b pb-2">
                                            <span className="text-sm font-medium text-muted-foreground">People Count</span>
                                            <span className="font-semibold">{selectedCenter.peopleCount}</span>
                                        </div>
                                        <div className="flex justify-between border-b pb-2">
                                            <span className="text-sm font-medium text-muted-foreground">Shortage Level</span>
                                            <span className="font-semibold">{selectedCenter.shortageLevel}/10</span>
                                        </div>
                                        <div className="flex justify-between border-b pb-2">
                                            <span className="text-sm font-medium text-muted-foreground">Priority Score</span>
                                            <span className="font-semibold text-destructive">{selectedCenter.priorityScore.toFixed(1)}</span>
                                        </div>
                                        <div className="pt-2">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-sm font-medium text-muted-foreground block">Available Local Inventory</span>
                                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={handleOpenEditDialog}>
                                                    <Edit2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                            {centerLocalInventory.length === 0 ? (
                                                <div className="text-xs text-muted-foreground border border-dashed rounded-md p-3 text-center bg-muted/50">
                                                    No local inventory found.
                                                </div>
                                            ) : (
                                                <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                                                    {centerLocalInventory.map((item, idx) => (
                                                        <div key={idx} className="flex justify-between bg-primary/10 px-2 py-1 rounded items-center">
                                                            <span className="text-xs font-medium">{item.itemName}</span>
                                                            <span className="text-xs font-bold text-primary">{item.quantity}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="md:col-span-2">
                                    <CardHeader>
                                        <CardTitle className="text-lg">Deliveries & Dispatches</CardTitle>
                                        <CardDescription>Monitor incoming resources for this center</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {centerDispatches.length === 0 ? (
                                            <div className="text-center py-6 text-muted-foreground">
                                                <Truck className="h-10 w-10 mx-auto mb-2 opacity-50" />
                                                <p>No active or past deliveries for this center.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {centerDispatches.map(dispatch => (
                                                    <div key={dispatch.id} className="flex gap-4 p-4 border rounded-xl items-start">
                                                        <div className={`p-2 rounded-full ${dispatch.status === 'out-for-delivery' ? 'bg-chart-2/20 text-chart-2' : dispatch.status === 'delivered' ? 'bg-primary/20 text-primary' : 'bg-chart-3/20 text-chart-3'}`}>
                                                            {dispatch.status === 'delivered' ? <CheckCircle className="h-5 w-5" /> : <Truck className="h-5 w-5" />}
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="font-medium text-sm">
                                                                {dispatch.status.replace('-', ' ').toUpperCase()}
                                                            </h4>
                                                            <p className="text-xs text-muted-foreground mt-1">
                                                                {dispatch.items.map(i => `${i.quantity}x ${i.itemName}`).join(', ')}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground mt-1">via {dispatch.volunteerName}</p>
                                                        </div>
                                                        {dispatch.status === 'out-for-delivery' && (
                                                            <Button size="sm" onClick={() => updateDispatchStatus(dispatch.id, 'delivered')}>
                                                                Mark Delivered
                                                            </Button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Request Resources Dialog */}
                        <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
                            <DialogContent className="max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Request Resources</DialogTitle>
                                    <DialogDescription>Select global inventory items to request for {selectedCenter?.name}.</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                                    {inventory.length === 0 && <p className="text-sm text-center">No inventory available at warehouse.</p>}
                                    {inventory.filter(i => i.quantity > 0).map(item => {
                                        const isSelected = requestItems.some(i => i.itemId === item.id);
                                        const selectedItem = requestItems.find(i => i.itemId === item.id);
                                        return (
                                            <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
                                                <Checkbox checked={isSelected} onCheckedChange={() => toggleItem(item.id, item.quantity)} />
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium">{item.name}</p>
                                                    <p className="text-xs text-muted-foreground">Available: {item.quantity}</p>
                                                </div>
                                                {isSelected && (
                                                    <Input
                                                        type="number" className="w-20 form-input"
                                                        value={selectedItem.quantity}
                                                        onChange={(e) => updateItemQuantity(item.id, parseInt(e.target.value) || 1)}
                                                        min={1} max={item.quantity}
                                                    />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsRequestDialogOpen(false)}>Cancel</Button>
                                    <Button onClick={handleRequestResource} disabled={requestItems.length === 0}>Submit Request</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        {/* Edit Inventory Dialog */}
                        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                            <DialogContent className="max-w-sm">
                                <DialogHeader>
                                    <DialogTitle>Edit Local Inventory</DialogTitle>
                                    <DialogDescription>Manually update inventory quantities.</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                                    {editInventoryItems.length === 0 && <p className="text-sm text-center text-muted-foreground">No items to edit.</p>}
                                    {editInventoryItems.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-3 p-3 border rounded-lg justify-between">
                                            <span className="text-sm font-medium">{item.itemName}</span>
                                            <Input
                                                type="number" className="w-20"
                                                value={item.quantity}
                                                onChange={(e) => handleEditItemQuantity(item.itemId, parseInt(e.target.value) || 0)}
                                                min={0}
                                            />
                                        </div>
                                    ))}
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                                    <Button onClick={handleSaveInventory} disabled={editInventoryItems.length === 0}>Save Changes</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </>
                )}
            </main>
        </div>
    );
}
