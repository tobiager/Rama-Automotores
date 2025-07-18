"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { Eye, EyeOff, Plus, Edit, Trash2, User, Lock, RotateCcw } from "lucide-react" // Importar Mail icon
import MultipleImageUpload from "../../components/multiple-image-upload"
import {
  getAllCars,
  createCar,
  updateCar,
  deleteCar,
  authenticateUser,
  restoreCar,
  getAllContacts, // Importar getAllContacts
  type Car,
  type AdminUser,
  type Contact, // Importar el tipo Contact
} from "../../lib/supabase"

export default function AdminPage() {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [loginData, setLoginData] = useState({ username: "", password: "" })
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingCar, setEditingCar] = useState<Car | null>(null)
  const [allCars, setAllCars] = useState<Car[]>([])
  const [contacts, setContacts] = useState<Contact[]>([]) // Nuevo estado para mensajes
  const [loading, setLoading] = useState(false)
  const [loginError, setLoginError] = useState("")
  const [activeTab, setActiveTab] = useState<"cars" | "messages">("cars") // Nuevo estado para las pestañas

  const [filterStatus, setFilterStatus] = useState<"active" | "sold" | "deleted">("active")

  const [newCar, setNewCar] = useState({
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    price: 0,
    image: "",
    images: [] as string[],
    description: "",
    sold: false,
    mileage: 0,
    fuel: "",
    transmission: "",
    color: "",
    features: [] as string[],
  })

  // Cargar datos cuando se loguea o cambia la pestaña
  useEffect(() => {
    if (currentUser) {
      if (activeTab === "cars") {
        loadCars()
      } else if (activeTab === "messages") {
        loadContacts()
      }
    }
  }, [currentUser, activeTab])

  const loadCars = async () => {
    setLoading(true)
    try {
      const carsData = await getAllCars()
      setAllCars(carsData)
    } catch (error) {
      console.error("Error loading cars:", error)
      alert("Error al cargar los autos")
    } finally {
      setLoading(false)
    }
  }

  const loadContacts = async () => {
    setLoading(true)
    try {
      const contactsData = await getAllContacts()
      setContacts(contactsData)
    } catch (error) {
      console.error("Error loading contacts:", error)
      alert("Error al cargar los mensajes de contacto")
    } finally {
      setLoading(false)
    }
  }

  // Filtrar autos para mostrar en la tabla
  const displayedCars = useMemo(() => {
    if (filterStatus === "active") {
      return allCars.filter((car) => !car.sold && !car.deleted)
    } else if (filterStatus === "sold") {
      return allCars.filter((car) => car.sold && !car.deleted)
    } else if (filterStatus === "deleted") {
      return allCars.filter((car) => car.deleted)
    }
    return []
  }, [allCars, filterStatus])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setLoginError("")

    try {
      const user = await authenticateUser(loginData.username, loginData.password)
      if (user) {
        setCurrentUser(user)
        setLoginData({ username: "", password: "" })
      } else {
        setLoginError("Usuario o contraseña incorrectos")
      }
    } catch (error) {
      console.error("Login error:", error)
      setLoginError("Error al iniciar sesión. Intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setLoginData({ username: "", password: "" })
    setAllCars([])
    setContacts([])
    resetForm()
  }

  const handleAddCar = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const carData = {
        ...newCar,
        features: newCar.features.filter((f) => f.trim() !== ""),
        image: newCar.images.length > 0 ? newCar.images[0] : "",
        images: newCar.images.filter((img) => img.trim() !== ""),
        deleted: false,
      }

      const createdCar = await createCar(carData)
      if (createdCar) {
        setAllCars([createdCar, ...allCars])
        resetForm()
        alert("Auto agregado exitosamente")
      } else {
        alert("Error al agregar el auto")
      }
    } catch (error) {
      console.error("Error creating car:", error)
      alert("Error al agregar el auto")
    } finally {
      setLoading(false)
    }
  }

  const handleEditCar = (car: Car) => {
    setEditingCar(car)

    const allImages = []
    if (car.image && car.image.trim() !== "" && !car.image.includes("placeholder.svg")) {
      allImages.push(car.image)
    }
    if (car.images && Array.isArray(car.images)) {
      car.images.forEach((img) => {
        if (img && img.trim() !== "" && !img.includes("placeholder.svg") && img !== car.image) {
          allImages.push(img)
        }
      })
    }

    setNewCar({
      brand: car.brand,
      model: car.model,
      year: car.year,
      price: car.price,
      image: car.image || "",
      images: allImages,
      description: car.description,
      sold: car.sold,
      mileage: car.mileage || 0,
      fuel: car.fuel || "",
      transmission: car.transmission || "",
      color: car.color || "",
      features: Array.isArray(car.features) ? car.features.filter((f) => f && f.trim() !== "") : [],
    })
    setShowAddForm(true)
  }

  const handleUpdateCar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCar) return

    setLoading(true)
    try {
      const carData = {
        ...newCar,
        features: newCar.features.filter((f) => f.trim() !== ""),
        image: newCar.images.length > 0 ? newCar.images[0] : "",
        images: newCar.images.filter((img) => img.trim() !== ""),
      }

      const updatedCar = await updateCar(editingCar.id, carData)
      if (updatedCar) {
        setAllCars(allCars.map((car) => (car.id === editingCar.id ? updatedCar : car)))
        resetForm()
        alert("Auto actualizado exitosamente")
      } else {
        alert("Error al actualizar el auto")
      }
    } catch (error) {
      console.error("Error updating car:", error)
      alert("Error al actualizar el auto")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCar = async (id: number) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este auto? Se moverá a la sección de eliminados.")) return

    setLoading(true)
    try {
      const success = await deleteCar(id)
      if (success) {
        setAllCars(allCars.map((car) => (car.id === id ? { ...car, deleted: true } : car)))
        alert("Auto eliminado exitosamente (movido a eliminados)")
      } else {
        alert("Error al eliminar el auto")
      }
    } catch (error) {
      console.error("Error deleting car:", error)
      alert("Error al eliminar el auto")
    } finally {
      setLoading(false)
    }
  }

  const handleRestoreCar = async (id: number) => {
    if (!confirm("¿Estás seguro de que quieres restaurar este auto?")) return

    setLoading(true)
    try {
      const restoredCar = await restoreCar(id)
      if (restoredCar) {
        setAllCars(allCars.map((car) => (car.id === id ? restoredCar : car)))
        alert("Auto restaurado exitosamente")
        setFilterStatus("active")
      } else {
        alert("Error al restaurar el auto")
      }
    } catch (error) {
      console.error("Error restoring car:", error)
      alert("Error al restaurar el auto")
    } finally {
      setLoading(false)
    }
  }

  const toggleSoldStatus = async (id: number) => {
    const car = allCars.find((c) => c.id === id)
    if (!car) return

    setLoading(true)
    try {
      const updatedCar = await updateCar(id, { sold: !car.sold })
      if (updatedCar) {
        setAllCars(allCars.map((c) => (c.id === id ? updatedCar : c)))
      } else {
        alert("Error al actualizar el estado")
      }
    } catch (error) {
      console.error("Error updating car status:", error)
      alert("Error al actualizar el estado")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setNewCar({
      brand: "",
      model: "",
      year: new Date().getFullYear(),
      price: 0,
      image: "",
      images: [],
      description: "",
      sold: false,
      mileage: 0,
      fuel: "",
      transmission: "",
      color: "",
      features: [],
    })
    setEditingCar(null)
    setShowAddForm(false)
  }

  const addFeature = () => {
    setNewCar({ ...newCar, features: [...newCar.features, ""] })
  }

  const updateFeature = (index: number, value: string) => {
    const updatedFeatures = [...newCar.features]
    updatedFeatures[index] = value
    setNewCar({ ...newCar, features: updatedFeatures })
  }

  const removeFeature = (index: number) => {
    setNewCar({ ...newCar, features: newCar.features.filter((_, i) => i !== index) })
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center py-20">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
          <div className="text-center mb-8">
            <div className="bg-gray-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-gray-300" />
            </div>
            <h1 className="text-2xl font-bold">Panel de Administración</h1>
            <p className="text-gray-400 mt-2">Ingresa tus credenciales para continuar</p>
          </div>

          {loginError && (
            <div className="mb-6 p-4 bg-red-600/20 border border-red-600 rounded-lg">
              <p className="text-red-400 text-sm">{loginError}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium mb-2 text-gray-300">
                Nombre de Usuario
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  id="username"
                  value={loginData.username}
                  onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ingresa tu usuario"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2 text-gray-300">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ingresa tu contraseña"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Verificando...
                </div>
              ) : (
                "Iniciar Sesión"
              )}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Panel de Administración</h1>
            <p className="text-gray-400 mt-1">Bienvenido, {currentUser.name}</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => {
                setActiveTab("cars")
                setShowAddForm(!showAddForm)
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              disabled={loading}
            >
              <Plus className="h-4 w-4" />
              Agregar Auto
            </button>
            <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg">
              Cerrar Sesión
            </button>
          </div>
        </div>

        {/* Pestañas de navegación */}
        <div className="mb-6 flex space-x-4 border-b border-gray-700 pb-4">
          <button
            onClick={() => {
              setActiveTab("cars")
              setShowAddForm(false)
            }}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === "cars" ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Gestión de Autos
          </button>
          <button
            onClick={() => {
              setActiveTab("messages")
              setShowAddForm(false)
            }}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === "messages" ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Mensajes de Contacto
          </button>
        </div>

        {/* Contenido de la pestaña de Autos */}
        {activeTab === "cars" && (
          <>
            {/* Formulario para agregar/editar auto */}
            {showAddForm && (
              <div className="bg-gray-800 p-6 rounded-lg mb-8">
                <h2 className="text-xl font-bold mb-4">{editingCar ? "Editar Auto" : "Agregar Nuevo Auto"}</h2>

                <form onSubmit={editingCar ? handleUpdateCar : handleAddCar} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Marca *</label>
                      <input
                        type="text"
                        value={newCar.brand}
                        onChange={(e) => setNewCar({ ...newCar, brand: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Modelo *</label>
                      <input
                        type="text"
                        value={newCar.model}
                        onChange={(e) => setNewCar({ ...newCar, model: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Año *</label>
                      <input
                        type="number"
                        value={newCar.year}
                        onChange={(e) => setNewCar({ ...newCar, year: Number.parseInt(e.target.value) })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                        min="1990"
                        max={new Date().getFullYear() + 1}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Precio (USD) *</label>
                      <input
                        type="number"
                        value={newCar.price}
                        onChange={(e) => setNewCar({ ...newCar, price: Number.parseInt(e.target.value) })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                        min="0"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Kilometraje</label>
                      <input
                        type="number"
                        value={newCar.mileage}
                        onChange={(e) => setNewCar({ ...newCar, mileage: Number.parseInt(e.target.value) })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Combustible</label>
                      <select
                        value={newCar.fuel}
                        onChange={(e) => setNewCar({ ...newCar, fuel: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                      >
                        <option value="">Seleccionar</option>
                        <option value="Gasolina">Gasolina</option>
                        <option value="Diesel">Diesel</option>
                        <option value="Eléctrico">Eléctrico</option>
                        <option value="Híbrido">Híbrido</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Transmisión</label>
                      <select
                        value={newCar.transmission}
                        onChange={(e) => setNewCar({ ...newCar, transmission: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                      >
                        <option value="">Seleccionar</option>
                        <option value="Manual">Manual</option>
                        <option value="Automática">Automática</option>
                        <option value="CVT">CVT</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Color</label>
                      <input
                        type="text"
                        value={newCar.color}
                        onChange={(e) => setNewCar({ ...newCar, color: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                      />
                    </div>
                  </div>

                  {/* Componente de múltiples imágenes */}
                  <div>
                    <MultipleImageUpload
                      currentImages={newCar.images}
                      onImagesChange={(imageUrls) => setNewCar({ ...newCar, images: imageUrls })}
                      maxImages={10}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Descripción *</label>
                    <textarea
                      value={newCar.description}
                      onChange={(e) => setNewCar({ ...newCar, description: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                      rows={3}
                      required
                    />
                  </div>

                  {/* Características */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium">Características</label>
                      <button
                        type="button"
                        onClick={addFeature}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                      >
                        Agregar
                      </button>
                    </div>
                    <div className="space-y-2">
                      {newCar.features.map((feature, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={feature}
                            onChange={(e) => updateFeature(index, e.target.value)}
                            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                            placeholder="Ej: Navegación GPS"
                          />
                          <button
                            type="button"
                            onClick={() => removeFeature(index)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg"
                    >
                      {loading ? "Guardando..." : editingCar ? "Actualizar Auto" : "Agregar Auto"}
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="bg-gray-600 hover:bg-gray-500 text-white px-6 py-2 rounded-lg"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Filtros de estado de autos */}
            <div className="mb-6 flex space-x-4">
              <button
                onClick={() => setFilterStatus("active")}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filterStatus === "active" ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                Autos Activos
              </button>
              <button
                onClick={() => setFilterStatus("sold")}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filterStatus === "sold" ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                Autos Vendidos
              </button>
              <button
                onClick={() => setFilterStatus("deleted")}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filterStatus === "deleted" ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                Autos Eliminados
              </button>
            </div>

            {/* Lista de autos */}
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              {loading && (
                <div className="p-4 text-center">
                  <p className="text-gray-400">Cargando...</p>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Auto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Año
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Precio
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Imágenes
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {displayedCars.map((car) => {
                      const totalImages =
                        (car.images && Array.isArray(car.images) ? car.images.length : 0) + (car.image ? 1 : 0)

                      return (
                        <tr key={car.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <img
                                src={car.image || "/placeholder.svg"}
                                alt={`${car.brand} ${car.model}`}
                                className="h-12 w-16 object-cover rounded mr-4"
                              />
                              <div>
                                <div className="text-sm font-medium text-white">
                                  {car.brand} {car.model}
                                </div>
                                <div className="text-sm text-gray-400 line-clamp-2">{car.description}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{car.year}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            ${car.price.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">
                              {totalImages} imagen{totalImages !== 1 ? "es" : ""}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {car.deleted ? (
                              <span className="px-2 py-1 text-xs rounded-full bg-gray-500 text-white">Eliminado</span>
                            ) : (
                              <button
                                onClick={() => toggleSoldStatus(car.id)}
                                disabled={loading}
                                className={`px-2 py-1 text-xs rounded-full ${
                                  car.sold ? "bg-red-600 text-white" : "bg-green-600 text-white"
                                }`}
                              >
                                {car.sold ? "Vendido" : "Disponible"}
                              </button>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              {!car.deleted && (
                                <>
                                  <button
                                    onClick={() => handleEditCar(car)}
                                    disabled={loading}
                                    className="text-blue-400 hover:text-blue-300 p-1 rounded transition-colors"
                                    title="Editar auto"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteCar(car.id)}
                                    disabled={loading}
                                    className="text-red-400 hover:text-red-300 p-1 rounded transition-colors"
                                    title="Eliminar auto"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </>
                              )}
                              {car.deleted && (
                                <button
                                  onClick={() => handleRestoreCar(car.id)}
                                  disabled={loading}
                                  className="text-green-400 hover:text-green-300 p-1 rounded transition-colors"
                                  title="Restaurar auto"
                                >
                                  <RotateCcw className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {displayedCars.length === 0 && !loading && (
                <div className="p-8 text-center">
                  <p className="text-gray-400">
                    No hay autos{" "}
                    {filterStatus === "active" ? "activos" : filterStatus === "sold" ? "vendidos" : "eliminados"} para
                    mostrar.
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Contenido de la pestaña de Mensajes */}
        {activeTab === "messages" && (
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <h2 className="text-xl font-bold p-6 border-b border-gray-700">Mensajes de Contacto</h2>
            {loading && (
              <div className="p-4 text-center">
                <p className="text-gray-400">Cargando mensajes...</p>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Teléfono
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Asunto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Mensaje
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {contacts.length > 0 ? (
                    contacts.map((contact) => (
                      <tr key={contact.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {contact.created_at ? new Date(contact.created_at).toLocaleDateString() : "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{contact.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          <a href={`mailto:${contact.email}`} className="hover:underline">
                            {contact.email}
                          </a>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{contact.phone || "N/A"}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {contact.subject || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300 max-w-xs overflow-hidden text-ellipsis">
                          {contact.message}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                        No hay mensajes de contacto para mostrar.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
