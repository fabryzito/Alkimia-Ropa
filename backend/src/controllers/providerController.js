import Provider from "../models/Provider.js"

// @desc    Get all providers
// @route   GET /api/providers
// @access  Private
export const getProviders = async (req, res, next) => {
  try {
    const providers = await Provider.find().sort({ name: 1 })

    const formattedProviders = providers.map((prov) => ({
      id: prov._id,
      name: prov.name,
      contact: prov.contact,
      phone: prov.phone,
      email: prov.email,
      address: prov.address,
      createdAt: prov.createdAt.toISOString().split("T")[0],
    }))

    res.status(200).json({
      success: true,
      data: formattedProviders,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get single provider
// @route   GET /api/providers/:id
// @access  Private
export const getProvider = async (req, res, next) => {
  try {
    const provider = await Provider.findById(req.params.id)

    if (!provider) {
      return res.status(404).json({
        success: false,
        error: "Proveedor no encontrado",
      })
    }

    res.status(200).json({
      success: true,
      data: {
        id: provider._id,
        name: provider.name,
        contact: provider.contact,
        phone: provider.phone,
        email: provider.email,
        address: provider.address,
        createdAt: provider.createdAt.toISOString().split("T")[0],
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Create provider
// @route   POST /api/providers
// @access  Private (Admin only)
export const createProvider = async (req, res, next) => {
  try {
    const provider = await Provider.create(req.body)

    res.status(201).json({
      success: true,
      data: {
        id: provider._id,
        name: provider.name,
        contact: provider.contact,
        phone: provider.phone,
        email: provider.email,
        address: provider.address,
        createdAt: provider.createdAt.toISOString().split("T")[0],
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Update provider
// @route   PUT /api/providers/:id
// @access  Private (Admin only)
export const updateProvider = async (req, res, next) => {
  try {
    let provider = await Provider.findById(req.params.id)

    if (!provider) {
      return res.status(404).json({
        success: false,
        error: "Proveedor no encontrado",
      })
    }

    provider = await Provider.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })

    res.status(200).json({
      success: true,
      data: {
        id: provider._id,
        name: provider.name,
        contact: provider.contact,
        phone: provider.phone,
        email: provider.email,
        address: provider.address,
        createdAt: provider.createdAt.toISOString().split("T")[0],
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Delete provider
// @route   DELETE /api/providers/:id
// @access  Private (Admin only)
export const deleteProvider = async (req, res, next) => {
  try {
    const provider = await Provider.findById(req.params.id)

    if (!provider) {
      return res.status(404).json({
        success: false,
        error: "Proveedor no encontrado",
      })
    }

    await provider.deleteOne()

    res.status(200).json({
      success: true,
      data: {},
    })
  } catch (error) {
    next(error)
  }
}
