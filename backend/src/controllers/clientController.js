import Client from "../models/Client.js"

// @desc    Get all clients
// @route   GET /api/clients
// @access  Private
export const getClients = async (req, res, next) => {
  try {
    const clients = await Client.find().sort({ createdAt: -1 })

    const formattedClients = clients.map((client) => ({
      id: client._id,
      name: client.name,
      lastName: client.lastName,
      dni: client.dni,
      email: client.email,
      phone: client.phone,
      address: client.address,
      createdAt: client.createdAt.toISOString().split("T")[0],
    }))

    res.status(200).json({
      success: true,
      data: formattedClients,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get single client
// @route   GET /api/clients/:id
// @access  Private
export const getClient = async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.id)

    if (!client) {
      return res.status(404).json({
        success: false,
        error: "Cliente no encontrado",
      })
    }

    res.status(200).json({
      success: true,
      data: {
        id: client._id,
        name: client.name,
        lastName: client.lastName,
        dni: client.dni,
        email: client.email,
        phone: client.phone,
        address: client.address,
        createdAt: client.createdAt.toISOString().split("T")[0],
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Search clients
// @route   GET /api/clients/search
// @access  Private
export const searchClients = async (req, res, next) => {
  try {
    const { q } = req.query

    if (!q) {
      return res.status(400).json({
        success: false,
        error: "Query de búsqueda requerido",
      })
    }

    const clients = await Client.find({
      $text: { $search: q },
    })

    const formattedClients = clients.map((client) => ({
      id: client._id,
      name: client.name,
      lastName: client.lastName,
      dni: client.dni,
      email: client.email,
      phone: client.phone,
      address: client.address,
      createdAt: client.createdAt.toISOString().split("T")[0],
    }))

    res.status(200).json({
      success: true,
      data: formattedClients,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Create client
// @route   POST /api/clients
// @access  Private
export const createClient = async (req, res, next) => {
  try {
    const client = await Client.create(req.body)

    res.status(201).json({
      success: true,
      data: {
        id: client._id,
        name: client.name,
        lastName: client.lastName,
        dni: client.dni,
        email: client.email,
        phone: client.phone,
        address: client.address,
        createdAt: client.createdAt.toISOString().split("T")[0],
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Update client
// @route   PUT /api/clients/:id
// @access  Private
export const updateClient = async (req, res, next) => {
  try {
    let client = await Client.findById(req.params.id)

    if (!client) {
      return res.status(404).json({
        success: false,
        error: "Cliente no encontrado",
      })
    }

    client = await Client.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })

    res.status(200).json({
      success: true,
      data: {
        id: client._id,
        name: client.name,
        lastName: client.lastName,
        dni: client.dni,
        email: client.email,
        phone: client.phone,
        address: client.address,
        createdAt: client.createdAt.toISOString().split("T")[0],
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Delete client
// @route   DELETE /api/clients/:id
// @access  Private
export const deleteClient = async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.id)

    if (!client) {
      return res.status(404).json({
        success: false,
        error: "Cliente no encontrado",
      })
    }

    await client.deleteOne()

    res.status(200).json({
      success: true,
      data: {},
    })
  } catch (error) {
    next(error)
  }
}
