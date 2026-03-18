'use client'

import { useState, useEffect } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { AppHeader } from '@/components/app-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useStore } from '@/lib/store'
import { 
  Plus, 
  Search, 
  Package, 
  Edit2, 
  Trash2, 
  AlertTriangle,
  TrendingDown,
  RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils'

const categoryColors = {
  food: 'bg-chart-3/10 text-chart-3 border-chart-3/20',
  water: 'bg-chart-2/10 text-chart-2 border-chart-2/20',
  medicine: 'bg-destructive/10 text-destructive border-destructive/20',
  shelter: 'bg-primary/10 text-primary border-primary/20',
  clothing: 'bg-chart-5/10 text-chart-5 border-chart-5/20',
  other: 'bg-muted text-muted-foreground'
}

export default function InventoryPage() {
  const inventory = useStore(state => state.inventory)
  const addInventoryItem = useStore(state => state.addInventoryItem)
  const updateInventoryItem = useStore(state => state.updateInventoryItem)
  const deleteInventoryItem = useStore(state => state.deleteInventoryItem)
  const bulkUpdateInventory = useStore(state => state.bulkUpdateInventory)
  const init = useStore(state => state.init)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [bulkMode, setBulkMode] = useState(false)
  const [bulkUpdates, setBulkUpdates] = useState({})
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    quantity: 0,
    unit: '',
    category: 'other',
    threshold: 0
  })
  
  // Initialize data on component mount
  useEffect(() => {
    init()
  }, [])
  
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter
    return matchesSearch && matchesCategory
  })
  
  const handleAddItem = () => {
    addInventoryItem(formData)
    setFormData({ name: '', quantity: 0, unit: '', category: 'other', threshold: 0 })
    setIsAddDialogOpen(false)
  }
  
  const handleUpdateItem = () => {
    if (editingItem) {
      updateInventoryItem(editingItem.id, formData)
      setEditingItem(null)
      setFormData({ name: '', quantity: 0, unit: '', category: 'other', threshold: 0 })
    }
  }
  
  const handleBulkUpdate = () => {
    const updates = Object.entries(bulkUpdates).map(([id, quantity]) => ({ id, quantity }))
    bulkUpdateInventory(updates)
    setBulkMode(false)
    setBulkUpdates({})
  }
  
  const startEdit = (item) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      category: item.category,
      threshold: item.threshold
    })
  }
  
  const lowStockCount = inventory.filter(i => i.quantity <= i.threshold).length
  const totalItems = inventory.reduce((sum, i) => sum + i.quantity, 0)
  
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="pl-64">
        <AppHeader 
          title="Inventory Management" 
          description="Track and manage all disaster relief resources"
        />
        
        <div className="p-6 space-y-6">
          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalItems.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Total Units</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-chart-3/10">
                  <RefreshCw className="h-6 w-6 text-chart-3" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{inventory.length}</p>
                  <p className="text-sm text-muted-foreground">Resource Types</p>
                </div>
              </CardContent>
            </Card>
            <Card className={cn(lowStockCount > 0 && 'border-destructive/50')}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-lg",
                  lowStockCount > 0 ? "bg-destructive/10" : "bg-primary/10"
                )}>
                  <TrendingDown className={cn(
                    "h-6 w-6",
                    lowStockCount > 0 ? "text-destructive" : "text-primary"
                  )} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{lowStockCount}</p>
                  <p className="text-sm text-muted-foreground">Low Stock Items</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search inventory..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="food">Food</SelectItem>
                <SelectItem value="water">Water</SelectItem>
                <SelectItem value="medicine">Medicine</SelectItem>
                <SelectItem value="shelter">Shelter</SelectItem>
                <SelectItem value="clothing">Clothing</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant={bulkMode ? "default" : "outline"}
              onClick={() => {
                if (bulkMode) {
                  handleBulkUpdate()
                } else {
                  setBulkMode(true)
                }
              }}
            >
              {bulkMode ? 'Save Bulk Update' : 'Bulk Update'}
            </Button>
            {bulkMode && (
              <Button variant="ghost" onClick={() => {
                setBulkMode(false)
                setBulkUpdates({})
              }}>
                Cancel
              </Button>
            )}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Inventory Item</DialogTitle>
                  <DialogDescription>
                    Add a new resource to the inventory system.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Name</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Bottled Water"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Quantity</label>
                      <Input
                        type="number"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Unit</label>
                      <Input
                        value={formData.unit}
                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                        placeholder="e.g., liters"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Category</label>
                      <Select
                        value={formData.category}
                        onValueChange={(v) => setFormData({ ...formData, category: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="food">Food</SelectItem>
                          <SelectItem value="water">Water</SelectItem>
                          <SelectItem value="medicine">Medicine</SelectItem>
                          <SelectItem value="shelter">Shelter</SelectItem>
                          <SelectItem value="clothing">Clothing</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Low Stock Threshold</label>
                      <Input
                        type="number"
                        value={formData.threshold}
                        onChange={(e) => setFormData({ ...formData, threshold: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddItem}>Add Item</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          {/* Inventory Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Inventory Items</CardTitle>
              <CardDescription>
                {filteredInventory.length} items found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Name</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Category</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Quantity</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Unit</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Threshold</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInventory.map(item => {
                      const isLowStock = item.quantity <= item.threshold
                      return (
                        <tr key={item.id} className="border-b border-border last:border-0 hover:bg-accent/50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {isLowStock && (
                                <AlertTriangle className="h-4 w-4 text-destructive" />
                              )}
                              <span className="font-medium text-foreground">{item.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline" className={cn('capitalize', categoryColors[item.category])}>
                              {item.category}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-right">
                            {bulkMode ? (
                              <Input
                                type="number"
                                className="w-24 ml-auto"
                                defaultValue={item.quantity}
                                onChange={(e) => setBulkUpdates({
                                  ...bulkUpdates,
                                  [item.id]: parseInt(e.target.value) || 0
                                })}
                              />
                            ) : (
                              <span className={cn(
                                "font-mono",
                                isLowStock && "text-destructive font-medium"
                              )}>
                                {item.quantity.toLocaleString()}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">{item.unit}</td>
                          <td className="py-3 px-4 text-right font-mono text-muted-foreground">
                            {item.threshold}
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant={isLowStock ? "destructive" : "outline"} className={cn(
                              !isLowStock && "bg-primary/10 text-primary border-primary/20"
                            )}>
                              {isLowStock ? 'Low Stock' : 'In Stock'}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => startEdit(item)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                onClick={() => deleteInventoryItem(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          
          {/* Edit Dialog */}
          <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Inventory Item</DialogTitle>
                <DialogDescription>
                  Update the details for this resource.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Quantity</label>
                    <Input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Unit</label>
                    <Input
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Category</label>
                    <Select
                      value={formData.category}
                      onValueChange={(v) => setFormData({ ...formData, category: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="food">Food</SelectItem>
                        <SelectItem value="water">Water</SelectItem>
                        <SelectItem value="medicine">Medicine</SelectItem>
                        <SelectItem value="shelter">Shelter</SelectItem>
                        <SelectItem value="clothing">Clothing</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Low Stock Threshold</label>
                    <Input
                      type="number"
                      value={formData.threshold}
                      onChange={(e) => setFormData({ ...formData, threshold: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditingItem(null)}>Cancel</Button>
                <Button onClick={handleUpdateItem}>Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  )
}
