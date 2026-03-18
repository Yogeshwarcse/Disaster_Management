'use client'

import { useState, useEffect } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { AppHeader } from '@/components/app-header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
  Users, 
  Phone, 
  Mail,
  MapPin,
  Edit2,
  UserCheck,
  UserX,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

const skillOptions = ['driving', 'first-aid', 'medical', 'logistics', 'counseling', 'cooking', 'heavy-lifting', 'translation', 'childcare', 'construction']

export default function VolunteersPage() {
  const volunteers = useStore(state => state.volunteers)
  const init = useStore(state => state.init)
  
  useEffect(() => {
    init()
  }, [])
  const addVolunteer = useStore(state => state.addVolunteer)
  const updateVolunteer = useStore(state => state.updateVolunteer)
  const releaseVolunteer = useStore(state => state.releaseVolunteer)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingVolunteer, setEditingVolunteer] = useState(null)
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    status: 'available',
    location: { lat: 37.7749, lng: -122.4194 },
    assignedTask: null,
    skills: []
  })
  
  const filteredVolunteers = volunteers.filter(vol => {
    const matchesSearch = vol.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vol.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || vol.status === statusFilter
    return matchesSearch && matchesStatus
  })
  
  const handleAddVolunteer = () => {
    addVolunteer(formData)
    setFormData({
      name: '',
      phone: '',
      email: '',
      status: 'available',
      location: { lat: 37.7749, lng: -122.4194 },
      assignedTask: null,
      skills: []
    })
    setIsAddDialogOpen(false)
  }
  
  const handleUpdateVolunteer = () => {
    if (editingVolunteer) {
      updateVolunteer(editingVolunteer.id, formData)
      setEditingVolunteer(null)
      setFormData({
        name: '',
        phone: '',
        email: '',
        status: 'available',
        location: { lat: 37.7749, lng: -122.4194 },
        assignedTask: null,
        skills: []
      })
    }
  }
  
  const startEdit = (vol) => {
    setEditingVolunteer(vol)
    setFormData({
      name: vol.name,
      phone: vol.phone,
      email: vol.email,
      status: vol.status,
      location: vol.location,
      assignedTask: vol.assignedTask,
      skills: vol.skills
    })
  }
  
  const toggleSkill = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }))
  }
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-primary/10 text-primary border-primary/20'
      case 'busy': return 'bg-chart-3/10 text-chart-3 border-chart-3/20'
      case 'offline': return 'bg-muted text-muted-foreground border-border'
      default: return 'bg-muted text-muted-foreground'
    }
  }
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'available': return <CheckCircle className="h-3 w-3" />
      case 'busy': return <Clock className="h-3 w-3" />
      case 'offline': return <XCircle className="h-3 w-3" />
      default: return null
    }
  }
  
  const stats = {
    total: volunteers.length,
    available: volunteers.filter(v => v.status === 'available').length,
    busy: volunteers.filter(v => v.status === 'busy').length,
    offline: volunteers.filter(v => v.status === 'offline').length
  }
  
  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }
  
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="pl-64">
        <AppHeader 
          title="Volunteer Management" 
          description="Register and manage volunteer assignments"
        />
        
        <div className="p-6 space-y-6">
          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total Volunteers</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <UserCheck className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">{stats.available}</p>
                  <p className="text-sm text-muted-foreground">Available</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-chart-3/10">
                  <Clock className="h-6 w-6 text-chart-3" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-chart-3">{stats.busy}</p>
                  <p className="text-sm text-muted-foreground">On Assignment</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                  <UserX className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-muted-foreground">{stats.offline}</p>
                  <p className="text-sm text-muted-foreground">Offline</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search volunteers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="busy">Busy</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
              </SelectContent>
            </Select>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Volunteer
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Register New Volunteer</DialogTitle>
                  <DialogDescription>
                    Add a new volunteer to the disaster relief team.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Full Name</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Smith"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Phone</label>
                      <Input
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+1-555-0100"
                      />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Email</label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="john@email.com"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Latitude</label>
                      <Input
                        type="number"
                        step="0.0001"
                        value={formData.location.lat}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          location: { ...formData.location, lat: parseFloat(e.target.value) || 0 }
                        })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Longitude</label>
                      <Input
                        type="number"
                        step="0.0001"
                        value={formData.location.lng}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          location: { ...formData.location, lng: parseFloat(e.target.value) || 0 }
                        })}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Skills</label>
                    <div className="flex flex-wrap gap-2">
                      {skillOptions.map(skill => (
                        <Badge
                          key={skill}
                          variant={formData.skills.includes(skill) ? 'default' : 'outline'}
                          className={cn(
                            "cursor-pointer transition-colors capitalize",
                            formData.skills.includes(skill) && "bg-primary text-primary-foreground"
                          )}
                          onClick={() => toggleSkill(skill)}
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddVolunteer}>Register</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          {/* Volunteers Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredVolunteers.map(volunteer => (
              <Card key={volunteer.id} className={cn(
                "transition-colors hover:border-primary/50",
                volunteer.status === 'busy' && "border-chart-3/50"
              )}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className={cn(
                        volunteer.status === 'available' && "bg-primary/10 text-primary",
                        volunteer.status === 'busy' && "bg-chart-3/10 text-chart-3",
                        volunteer.status === 'offline' && "bg-muted text-muted-foreground"
                      )}>
                        {getInitials(volunteer.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-foreground truncate">{volunteer.name}</h3>
                        <Badge variant="outline" className={cn("text-xs", getStatusColor(volunteer.status))}>
                          {getStatusIcon(volunteer.status)}
                          <span className="ml-1 capitalize">{volunteer.status}</span>
                        </Badge>
                      </div>
                      <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3" />
                          <span>{volunteer.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3" />
                          <span className="truncate">{volunteer.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3" />
                          <span>{volunteer.location.lat.toFixed(3)}, {volunteer.location.lng.toFixed(3)}</span>
                        </div>
                      </div>
                      
                      {/* Skills */}
                      <div className="mt-3 flex flex-wrap gap-1">
                        {volunteer.skills.slice(0, 3).map(skill => (
                          <Badge key={skill} variant="secondary" className="text-xs capitalize">
                            {skill}
                          </Badge>
                        ))}
                        {volunteer.skills.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{volunteer.skills.length - 3}
                          </Badge>
                        )}
                      </div>
                      
                      {/* Assigned Task */}
                      {volunteer.assignedTask && (
                        <div className="mt-3 p-2 rounded-lg bg-chart-3/10 border border-chart-3/20">
                          <p className="text-xs font-medium text-chart-3">Current Task:</p>
                          <p className="text-xs text-muted-foreground truncate">{volunteer.assignedTask}</p>
                        </div>
                      )}
                      
                      {/* Actions */}
                      <div className="mt-3 flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex-1"
                          onClick={() => startEdit(volunteer)}
                        >
                          <Edit2 className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        {volunteer.status === 'busy' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => releaseVolunteer(volunteer.id)}
                          >
                            <UserCheck className="h-3 w-3 mr-1" />
                            Release
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {filteredVolunteers.length === 0 && (
            <Card className="p-12">
              <div className="text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground">No Volunteers Found</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filters'
                    : 'Add volunteers to get started'}
                </p>
              </div>
            </Card>
          )}
          
          {/* Edit Dialog */}
          <Dialog open={!!editingVolunteer} onOpenChange={(open) => !open && setEditingVolunteer(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Edit Volunteer</DialogTitle>
                <DialogDescription>
                  Update volunteer information and status.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Phone</label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select
                    value={formData.status}
                    onValueChange={(v) => setFormData({ ...formData, status: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="busy">Busy</SelectItem>
                      <SelectItem value="offline">Offline</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Skills</label>
                  <div className="flex flex-wrap gap-2">
                    {skillOptions.map(skill => (
                      <Badge
                        key={skill}
                        variant={formData.skills.includes(skill) ? 'default' : 'outline'}
                        className={cn(
                          "cursor-pointer transition-colors capitalize",
                          formData.skills.includes(skill) && "bg-primary text-primary-foreground"
                        )}
                        onClick={() => toggleSkill(skill)}
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditingVolunteer(null)}>Cancel</Button>
                <Button onClick={handleUpdateVolunteer}>Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  )
}
