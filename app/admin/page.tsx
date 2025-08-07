'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/lib/supabase'
import MultipleImageUpload from '@/components/multiple-image-upload'
import { Car, Users, MessageSquare, FileText, Plus, Trash2, Upload, Edit, Eye, CheckCircle, XCircle, Loader2, AlertCircle, Download, User, Lock, EyeOff } from 'lucide-react'

interface Car {
  id: number
  brand: string
  model: string
  year: number
  price: number
  mileage: number
  fuel: string
  transmission: string
  color: string
  description: string
  images: string[]
  sold: boolean
  deleted: boolean
  created_at: string
}

interface ContactMessage {
  id: number
  name: string
  email: string
  phone: string
  message: string
  created_at: string
}

interface Cotizacion {
  id: number
  mes: number
  anio: number
  nombre_archivo: string
  url: string
  estado: string
  fecha_subida: string
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [cars, setCars] = useState<Car[]>([])
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('cars')
  const [filter, setFilter] = useState<'all' | 'available' | 'sold' | 'deleted'>('all')
  const [editingCar, setEditingCar] = useState<Car | null>(null)

  // New car form state
  const [newCar, setNewCar] = useState({
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    price: 0,
    mileage: 0,
    fuel: 'Nafta',
    transmission: 'Manual',
    color: '',
    description: '',
    images: [] as string[]
  })

  // Estados para cotizaciones
  const [uploadingCotizacion, setUploadingCotizacion] = useState(false)
  const [cotizacionFile, setCotizacionFile] = useState<File | null>(null)
  const [cotizacionMes, setCotizacionMes] = useState('')
  const [cotizacionAnio, setCotizacionAnio] = useState('')
  const [cotizacionMessage, setCotizacionMessage] = useState('')
  const [cotizacionError, setCotizacionError] = useState('')

  useEffect(() => {
    // Check if already logged in
    const adminToken = localStorage.getItem('admin_token')
    if (adminToken) {
      setIsAuthenticated(true)
      loadData()
    }
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        loadCars(),
        loadMessages(),
        loadCotizaciones()
      ])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCars = async () => {
    try {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setCars(data || [])
    } catch (error) {
      console.error('Error loading cars:', error)
      setCars([])
    }
  }

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error('Error loading messages:', error)
      setMessages([])
    }
  }

  const loadCotizaciones = async () => {
    try {
      const { data, error } = await supabase
        .from('cotizaciones')
        .select('*')
        .order('fecha_subida', { ascending: false })

      if (error) throw error
      setCotizaciones(data || [])
    } catch (error) {
      console.error('Error loading cotizaciones:', error)
      setCotizaciones([])
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    setLoading(true)

    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .single()

      if (error || !data) {
        setLoginError('Credenciales incorrectas')
        return
      }

      localStorage.setItem('admin_token', 'authenticated')
      setIsAuthenticated(true)
      await loadData()
    } catch (error) {
      setLoginError('Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    setIsAuthenticated(false)
    setUsername('')
    setPassword('')
  }

  const handleAddCar = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from('cars')
        .insert([{ ...newCar, sold: false, deleted: false }])

      if (!error) {
        setNewCar({
          brand: '',
          model: '',
          year: new Date().getFullYear(),
          price: 0,
          mileage: 0,
          fuel: 'Nafta',
          transmission: 'Manual',
          color: '',
          description: '',
          images: []
        })
        await loadCars()
      }
    } catch (error) {
      console.error('Error adding car:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateCar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCar) return

    setLoading(true)

    try {
      const { error } = await supabase
        .from('cars')
        .update(editingCar)
        .eq('id', editingCar.id)

      if (!error) {
        setEditingCar(null)
        await loadCars()
      }
    } catch (error) {
      console.error('Error updating car:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateCarStatus = async (carId: number, newSold: boolean) => {
    try {
      const { error } = await supabase
        .from('cars')
        .update({ sold: newSold })
        .eq('id', carId)

      if (error) throw error

      // Update local state
      setCars(cars.map(car => 
        car.id === carId ? { ...car, sold: newSold } : car
      ))
    } catch (error) {
      console.error('Error updating car status:', error)
    }
  }

  const restoreCar = async (carId: number) => {
    try {
      const { error } = await supabase
        .from('cars')
        .update({ deleted: false })
        .eq('id', carId)

      if (error) throw error

      // Update local state
      setCars(cars.map(car => 
        car.id === carId ? { ...car, deleted: false } : car
      ))
    } catch (error) {
      console.error('Error restoring car:', error)
    }
  }

  const softDeleteCar = async (carId: number) => {
    try {
      const { error } = await supabase
        .from('cars')
        .update({ deleted: true })
        .eq('id', carId)

      if (error) throw error

      // Update local state
      setCars(cars.map(car => 
        car.id === carId ? { ...car, deleted: true } : car
      ))
    } catch (error) {
      console.error('Error deleting car:', error)
    }
  }

  const handleCotizacionUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!cotizacionFile || !cotizacionMes || !cotizacionAnio) {
      setCotizacionError('Por favor completa todos los campos')
      return
    }

    setUploadingCotizacion(true)
    setCotizacionError('')
    setCotizacionMessage('')

    try {
      // Upload file to Supabase Storage
      const fileName = `${cotizacionAnio}-${cotizacionMes.padStart(2, '0')}-cotizacion.pdf`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('cotizaciones')
        .upload(fileName, cotizacionFile, {
          upsert: true
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('cotizaciones')
        .getPublicUrl(fileName)

      // Save to database
      const { error: dbError } = await supabase
        .from('cotizaciones')
        .upsert({
          mes: parseInt(cotizacionMes),
          anio: parseInt(cotizacionAnio),
          nombre_archivo: fileName,
          url: urlData.publicUrl,
          estado: 'completado'
        })

      if (dbError) throw dbError

      setCotizacionMessage('Cotización subida exitosamente')
      setCotizacionFile(null)
      setCotizacionMes('')
      setCotizacionAnio('')
      await loadCotizaciones()
    } catch (error) {
      setCotizacionError('Error al subir la cotización')
      console.error('Upload error:', error)
    } finally {
      setUploadingCotizacion(false)
    }
  }

  const handleDeleteCotizacion = async (id: number) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta cotización?')) {
      return
    }

    try {
      const cotizacion = cotizaciones.find(c => c.id === id)
      if (!cotizacion) return

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('cotizaciones')
        .remove([cotizacion.nombre_archivo])

      if (storageError) {
        console.error('Error deleting from storage:', storageError)
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('cotizaciones')
        .delete()
        .eq('id', id)

      if (dbError) throw dbError

      setCotizacionMessage('Cotización eliminada exitosamente')
      await loadCotizaciones()
    } catch (error) {
      setCotizacionError('Error al eliminar la cotización')
      console.error('Delete error:', error)
    }
  }

  const getMonthName = (month: number) => {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ]
    return months[month - 1] || 'Mes inválido'
  }

  const formatPrice = (price: number | undefined | null) => {
    if (price === undefined || price === null || isNaN(price)) {
      return '$0'
    }
    return `$${price.toLocaleString()}`
  }

  const filteredCars = cars.filter(car => {
    if (!car) return false
    
    switch (filter) {
      case 'available':
        return !car.sold && !car.deleted
      case 'sold':
        return car.sold && !car.deleted
      case 'deleted':
        return car.deleted
      default:
        return !car.deleted
    }
  })

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white">Panel de Administración</h2>
            <p className="mt-2 text-gray-400">Ingresa tus credenciales para continuar</p>
          </div>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="text-center">
              <div className="bg-gray-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-8 w-8 text-gray-300" />
              </div>
              <CardTitle className="text-white">Iniciar Sesión</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="username" className="text-gray-300">Usuario</Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      placeholder="Ingresa tu usuario"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="password" className="text-gray-300">Contraseña</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      placeholder="Ingresa tu contraseña"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                {loginError && (
                  <Alert variant="destructive" className="bg-red-900/20 border-red-800">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-red-300">{loginError}</AlertDescription>
                  </Alert>
                )}
                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Iniciando sesión...
                    </>
                  ) : (
                    'Iniciar Sesión'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white">Panel de Administración</h1>
              <p className="text-gray-400">Gestiona autos, mensajes y cotizaciones</p>
            </div>
            <Button 
              onClick={handleLogout}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Cerrar Sesión
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Car className="h-8 w-8 text-blue-400" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-400">Total Autos</p>
                    <p className="text-2xl font-bold text-white">{cars.filter(c => c && !c.deleted).length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-400" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-400">Disponibles</p>
                    <p className="text-2xl font-bold text-white">
                      {cars.filter(c => c && !c.sold && !c.deleted).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <MessageSquare className="h-8 w-8 text-purple-400" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-400">Mensajes</p>
                    <p className="text-2xl font-bold text-white">{messages.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-orange-400" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-400">Cotizaciones</p>
                    <p className="text-2xl font-bold text-white">{cotizaciones.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-gray-800 border-gray-700">
              <TabsTrigger value="cars" className="data-[state=active]:bg-gray-700 text-gray-300">
                <Car className="h-4 w-4 mr-2" />
                Autos
              </TabsTrigger>
              <TabsTrigger value="messages" className="data-[state=active]:bg-gray-700 text-gray-300">
                <MessageSquare className="h-4 w-4 mr-2" />
                Mensajes
              </TabsTrigger>
              <TabsTrigger value="cotizaciones" className="data-[state=active]:bg-gray-700 text-gray-300">
                <FileText className="h-4 w-4 mr-2" />
                Cotizaciones
              </TabsTrigger>
              <TabsTrigger value="add-car" className="data-[state=active]:bg-gray-700 text-gray-300">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Auto
              </TabsTrigger>
            </TabsList>

            {/* Cars Tab */}
            <TabsContent value="cars" className="space-y-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-white">Gestión de Autos</CardTitle>
                    <div className="flex gap-2">
                      <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
                        <SelectTrigger className="w-40 bg-gray-700 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-700 border-gray-600">
                          <SelectItem value="all" className="text-white">Todos</SelectItem>
                          <SelectItem value="available" className="text-white">Disponibles</SelectItem>
                          <SelectItem value="sold" className="text-white">Vendidos</SelectItem>
                          <SelectItem value="deleted" className="text-white">Eliminados</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-700">
                          <TableHead className="text-gray-300">Auto</TableHead>
                          <TableHead className="text-gray-300">Precio</TableHead>
                          <TableHead className="text-gray-300">Estado</TableHead>
                          <TableHead className="text-gray-300">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCars.map((car) => (
                          <TableRow key={car.id} className="border-gray-700">
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <img
                                  src={car.images?.[0] || '/placeholder.jpg'}
                                  alt={`${car.brand || 'Auto'} ${car.model || ''}`}
                                  className="h-12 w-12 rounded-lg object-cover"
                                />
                                <div>
                                  <p className="font-medium text-white">
                                    {car.brand || 'Sin marca'} {car.model || 'Sin modelo'}
                                  </p>
                                  <p className="text-sm text-gray-400">{car.year || 'Sin año'}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-white">
                              {formatPrice(car.price)}
                            </TableCell>
                            <TableCell>
                              <Badge variant={
                                car.deleted ? 'destructive' :
                                !car.sold ? 'default' : 'secondary'
                              }>
                                {car.deleted ? 'Eliminado' : 
                                 !car.sold ? 'Disponible' : 'Vendido'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                {car.deleted ? (
                                  <Button
                                    size="sm"
                                    onClick={() => restoreCar(car.id)}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    Restaurar
                                  </Button>
                                ) : (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => setEditingCar(car)}
                                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => window.open(`/autos/${car.id}`, '_blank')}
                                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    
                                    {!car.sold ? (
                                      <Button
                                        size="sm"
                                        onClick={() => updateCarStatus(car.id, true)}
                                        className="bg-orange-600 hover:bg-orange-700"
                                      >
                                        Marcar Vendido
                                      </Button>
                                    ) : (
                                      <Button
                                        size="sm"
                                        onClick={() => updateCarStatus(car.id, false)}
                                        className="bg-green-600 hover:bg-green-700"
                                      >
                                        Marcar Disponible
                                      </Button>
                                    )}
                                    
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button
                                          size="sm"
                                          variant="destructive"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent className="bg-gray-800 border-gray-700">
                                        <AlertDialogHeader>
                                          <AlertDialogTitle className="text-white">
                                            ¿Eliminar auto?
                                          </AlertDialogTitle>
                                          <AlertDialogDescription className="text-gray-400">
                                            Esta acción moverá el auto a la papelera. Podrás restaurarlo después.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel className="bg-gray-700 border-gray-600 text-gray-300">
                                            Cancelar
                                          </AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() => softDeleteCar(car.id)}
                                            className="bg-red-600 hover:bg-red-700"
                                          >
                                            Eliminar
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  
                  {filteredCars.length === 0 && (
                    <div className="text-center py-8">
                      <Car className="h-12 w-12 mx-auto text-gray-600 mb-4" />
                      <p className="text-gray-400">No hay autos para mostrar</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Messages Tab */}
            <TabsContent value="messages" className="space-y-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Mensajes de Contacto</CardTitle>
                  <CardDescription className="text-gray-400">
                    Mensajes recibidos desde el formulario de contacto
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-700">
                          <TableHead className="text-gray-300">Nombre</TableHead>
                          <TableHead className="text-gray-300">Email</TableHead>
                          <TableHead className="text-gray-300">Teléfono</TableHead>
                          <TableHead className="text-gray-300">Mensaje</TableHead>
                          <TableHead className="text-gray-300">Fecha</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {messages.map((message) => (
                          <TableRow key={message.id} className="border-gray-700">
                            <TableCell className="text-white font-medium">
                              {message.name || 'Sin nombre'}
                            </TableCell>
                            <TableCell className="text-gray-300">
                              {message.email || 'Sin email'}
                            </TableCell>
                            <TableCell className="text-gray-300">
                              {message.phone || 'Sin teléfono'}
                            </TableCell>
                            <TableCell className="text-gray-300 max-w-xs truncate">
                              {message.message || 'Sin mensaje'}
                            </TableCell>
                            <TableCell className="text-gray-300">
                              {message.created_at ? new Date(message.created_at).toLocaleDateString('es-ES') : 'Sin fecha'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  
                  {messages.length === 0 && (
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 mx-auto text-gray-600 mb-4" />
                      <p className="text-gray-400">No hay mensajes para mostrar</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Cotizaciones Tab */}
            <TabsContent value="cotizaciones" className="space-y-6">
              {/* Upload Form */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Subir Nueva Cotización
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Sube un archivo PDF con la cotización mensual
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCotizacionUpload} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="mes" className="text-gray-300">Mes</Label>
                        <Select value={cotizacionMes} onValueChange={setCotizacionMes}>
                          <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                            <SelectValue placeholder="Selecciona el mes" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-700 border-gray-600">
                            {Array.from({ length: 12 }, (_, i) => (
                              <SelectItem key={i + 1} value={(i + 1).toString()} className="text-white">
                                {getMonthName(i + 1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="anio" className="text-gray-300">Año</Label>
                        <Select value={cotizacionAnio} onValueChange={setCotizacionAnio}>
                          <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                            <SelectValue placeholder="Selecciona el año" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-700 border-gray-600">
                            {Array.from({ length: 5 }, (_, i) => {
                              const year = new Date().getFullYear() + i
                              return (
                                <SelectItem key={year} value={year.toString()} className="text-white">
                                  {year}
                                </SelectItem>
                              )
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="file" className="text-gray-300">Archivo PDF</Label>
                      <Input
                        id="file"
                        type="file"
                        accept=".pdf"
                        onChange={(e) => setCotizacionFile(e.target.files?.[0] || null)}
                        className="bg-gray-700 border-gray-600 text-white file:bg-gray-600 file:text-white file:border-0"
                      />
                    </div>

                    {cotizacionError && (
                      <Alert variant="destructive" className="bg-red-900/20 border-red-800">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-red-300">{cotizacionError}</AlertDescription>
                      </Alert>
                    )}

                    {cotizacionMessage && (
                      <Alert className="bg-green-900/20 border-green-800">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        <AlertDescription className="text-green-300">{cotizacionMessage}</AlertDescription>
                      </Alert>
                    )}

                    <Button 
                      type="submit" 
                      disabled={uploadingCotizacion || !cotizacionFile || !cotizacionMes || !cotizacionAnio}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {uploadingCotizacion ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Subiendo...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Subir Cotización
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Cotizaciones List */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Lista de Cotizaciones</CardTitle>
                  <CardDescription className="text-gray-400">
                    Todas las cotizaciones subidas al sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-700">
                          <TableHead className="text-gray-300">Período</TableHead>
                          <TableHead className="text-gray-300">Archivo</TableHead>
                          <TableHead className="text-gray-300">Estado</TableHead>
                          <TableHead className="text-gray-300">Fecha</TableHead>
                          <TableHead className="text-gray-300">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cotizaciones.map((cotizacion) => (
                          <TableRow key={cotizacion.id} className="border-gray-700">
                            <TableCell className="text-white font-medium">
                              {getMonthName(cotizacion.mes)} {cotizacion.anio}
                            </TableCell>
                            <TableCell className="text-gray-300">
                              {cotizacion.nombre_archivo || 'Sin nombre'}
                            </TableCell>
                            <TableCell>
                              <Badge variant={
                                cotizacion.estado === 'completado' ? 'default' : 
                                cotizacion.estado === 'error' ? 'destructive' : 'secondary'
                              }>
                                {cotizacion.estado || 'Sin estado'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-gray-300">
                              {cotizacion.fecha_subida ? new Date(cotizacion.fecha_subida).toLocaleDateString('es-ES') : 'Sin fecha'}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => window.open(cotizacion.url, '_blank')}
                                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    const link = document.createElement('a')
                                    link.href = cotizacion.url
                                    link.download = cotizacion.nombre_archivo
                                    link.click()
                                  }}
                                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent className="bg-gray-800 border-gray-700">
                                    <AlertDialogHeader>
                                      <AlertDialogTitle className="text-white">
                                        ¿Eliminar cotización?
                                      </AlertDialogTitle>
                                      <AlertDialogDescription className="text-gray-400">
                                        Esta acción eliminará permanentemente la cotización y el archivo PDF.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel className="bg-gray-700 border-gray-600 text-gray-300">
                                        Cancelar
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDeleteCotizacion(cotizacion.id)}
                                        className="bg-red-600 hover:bg-red-700"
                                      >
                                        Eliminar
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  
                  {cotizaciones.length === 0 && (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 mx-auto text-gray-600 mb-4" />
                      <p className="text-gray-400">No hay cotizaciones subidas aún</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Add Car Tab */}
            <TabsContent value="add-car" className="space-y-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Agregar Nuevo Auto</CardTitle>
                  <CardDescription className="text-gray-400">
                    Completa la información del nuevo vehículo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddCar} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="brand" className="text-gray-300">Marca</Label>
                        <Input
                          id="brand"
                          value={newCar.brand}
                          onChange={(e) => setNewCar({ ...newCar, brand: e.target.value })}
                          className="bg-gray-700 border-gray-600 text-white"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="model" className="text-gray-300">Modelo</Label>
                        <Input
                          id="model"
                          value={newCar.model}
                          onChange={(e) => setNewCar({ ...newCar, model: e.target.value })}
                          className="bg-gray-700 border-gray-600 text-white"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="year" className="text-gray-300">Año</Label>
                        <Input
                          id="year"
                          type="number"
                          value={newCar.year}
                          onChange={(e) => setNewCar({ ...newCar, year: parseInt(e.target.value) || 0 })}
                          className="bg-gray-700 border-gray-600 text-white"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="price" className="text-gray-300">Precio</Label>
                        <Input
                          id="price"
                          type="number"
                          value={newCar.price}
                          onChange={(e) => setNewCar({ ...newCar, price: parseInt(e.target.value) || 0 })}
                          className="bg-gray-700 border-gray-600 text-white"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="mileage" className="text-gray-300">Kilometraje</Label>
                        <Input
                          id="mileage"
                          type="number"
                          value={newCar.mileage}
                          onChange={(e) => setNewCar({ ...newCar, mileage: parseInt(e.target.value) || 0 })}
                          className="bg-gray-700 border-gray-600 text-white"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="color" className="text-gray-300">Color</Label>
                        <Input
                          id="color"
                          value={newCar.color}
                          onChange={(e) => setNewCar({ ...newCar, color: e.target.value })}
                          className="bg-gray-700 border-gray-600 text-white"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="fuel" className="text-gray-300">Combustible</Label>
                        <Select value={newCar.fuel} onValueChange={(value) => setNewCar({ ...newCar, fuel: value })}>
                          <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-700 border-gray-600">
                            <SelectItem value="Nafta" className="text-white">Nafta</SelectItem>
                            <SelectItem value="Diesel" className="text-white">Diesel</SelectItem>
                            <SelectItem value="GNC" className="text-white">GNC</SelectItem>
                            <SelectItem value="Híbrido" className="text-white">Híbrido</SelectItem>
                            <SelectItem value="Eléctrico" className="text-white">Eléctrico</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="transmission" className="text-gray-300">Transmisión</Label>
                        <Select value={newCar.transmission} onValueChange={(value) => setNewCar({ ...newCar, transmission: value })}>
                          <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-700 border-gray-600">
                            <SelectItem value="Manual" className="text-white">Manual</SelectItem>
                            <SelectItem value="Automática" className="text-white">Automática</SelectItem>
                            <SelectItem value="CVT" className="text-white">CVT</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="description" className="text-gray-300">Descripción</Label>
                      <Textarea
                        id="description"
                        value={newCar.description}
                        onChange={(e) => setNewCar({ ...newCar, description: e.target.value })}
                        className="bg-gray-700 border-gray-600 text-white"
                        rows={4}
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">Imágenes</Label>
                      <MultipleImageUpload
                        currentImages={newCar.images}
                        onImagesChange={(images) => setNewCar({ ...newCar, images })}
                        maxImages={10}
                      />
                    </div>
                    <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Agregando...
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Agregar Auto
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Edit Car Modal */}
          {editingCar && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Editar Auto</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdateCar} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="edit-brand" className="text-gray-300">Marca</Label>
                        <Input
                          id="edit-brand"
                          value={editingCar.brand || ''}
                          onChange={(e) => setEditingCar({ ...editingCar, brand: e.target.value })}
                          className="bg-gray-700 border-gray-600 text-white"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-model" className="text-gray-300">Modelo</Label>
                        <Input
                          id="edit-model"
                          value={editingCar.model || ''}
                          onChange={(e) => setEditingCar({ ...editingCar, model: e.target.value })}
                          className="bg-gray-700 border-gray-600 text-white"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-year" className="text-gray-300">Año</Label>
                        <Input
                          id="edit-year"
                          type="number"
                          value={editingCar.year || ''}
                          onChange={(e) => setEditingCar({ ...editingCar, year: parseInt(e.target.value) || 0 })}
                          className="bg-gray-700 border-gray-600 text-white"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-price" className="text-gray-300">Precio</Label>
                        <Input
                          id="edit-price"
                          type="number"
                          value={editingCar.price || ''}
                          onChange={(e) => setEditingCar({ ...editingCar, price: parseInt(e.target.value) || 0 })}
                          className="bg-gray-700 border-gray-600 text-white"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-mileage" className="text-gray-300">Kilometraje</Label>
                        <Input
                          id="edit-mileage"
                          type="number"
                          value={editingCar.mileage || ''}
                          onChange={(e) => setEditingCar({ ...editingCar, mileage: parseInt(e.target.value) || 0 })}
                          className="bg-gray-700 border-gray-600 text-white"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-color" className="text-gray-300">Color</Label>
                        <Input
                          id="edit-color"
                          value={editingCar.color || ''}
                          onChange={(e) => setEditingCar({ ...editingCar, color: e.target.value })}
                          className="bg-gray-700 border-gray-600 text-white"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-fuel" className="text-gray-300">Combustible</Label>
                        <Select value={editingCar.fuel || 'Nafta'} onValueChange={(value) => setEditingCar({ ...editingCar, fuel: value })}>
                          <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-700 border-gray-600">
                            <SelectItem value="Nafta" className="text-white">Nafta</SelectItem>
                            <SelectItem value="Diesel" className="text-white">Diesel</SelectItem>
                            <SelectItem value="GNC" className="text-white">GNC</SelectItem>
                            <SelectItem value="Híbrido" className="text-white">Híbrido</SelectItem>
                            <SelectItem value="Eléctrico" className="text-white">Eléctrico</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="edit-transmission" className="text-gray-300">Transmisión</Label>
                        <Select value={editingCar.transmission || 'Manual'} onValueChange={(value) => setEditingCar({ ...editingCar, transmission: value })}>
                          <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-700 border-gray-600">
                            <SelectItem value="Manual" className="text-white">Manual</SelectItem>
                            <SelectItem value="Automática" className="text-white">Automática</SelectItem>
                            <SelectItem value="CVT" className="text-white">CVT</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="edit-description" className="text-gray-300">Descripción</Label>
                      <Textarea
                        id="edit-description"
                        value={editingCar.description || ''}
                        onChange={(e) => setEditingCar({ ...editingCar, description: e.target.value })}
                        className="bg-gray-700 border-gray-600 text-white"
                        rows={4}
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">Imágenes</Label>
                      <MultipleImageUpload
                        currentImages={editingCar.images || []}
                        onImagesChange={(images) => setEditingCar({ ...editingCar, images })}
                        maxImages={10}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Guardando...
                          </>
                        ) : (
                          'Guardar Cambios'
                        )}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setEditingCar(null)} className="border-gray-600 text-gray-300 hover:bg-gray-700">
                        Cancelar
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
