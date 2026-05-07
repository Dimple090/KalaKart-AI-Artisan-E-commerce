import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import {
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  Package,
  X,
  Sparkles,
  Box,
  Share2,
  ArrowRight,
  Check,
  Video,
  Copy,
  Wand2,
  Leaf,
  PieChart as PieChartIcon,
  Upload,
  PlayCircle,
  AlertCircle,
} from "lucide-react";
import AvatarGenerator from "../components/AvatarGenerator";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Link } from "react-router-dom";
import AccessDenied from "./AccessDenied";
import { apiUrl } from '../lib/api';

const getCustomerId = (order) => {
  if (!order?.user) return null;
  return order.user._id || order.user;
};

const generateMonthlySalesData = (orderData = []) => {
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      name: date.toLocaleString("en-US", { month: "short" }),
      sales: 0,
    };
  });

  const buckets = new Map(months.map((month) => [month.key, month]));
  orderData.forEach((order) => {
    const created = new Date(order.createdAt || Date.now());
    const key = `${created.getFullYear()}-${created.getMonth()}`;
    const bucket = buckets.get(key);
    if (!bucket) return;

    const itemCount =
      order.orderItems?.reduce(
        (sum, item) => sum + (Number(item.quantity ?? item.qty) || 1),
        0,
      ) || 1;
    bucket.sales += itemCount;
  });

  return months;
};

const calculateRepeatCustomers = (orderData = []) => {
  const customerCounts = {};
  orderData.forEach((order) => {
    const customerId = getCustomerId(order);
    if (!customerId) return;
    customerCounts[customerId] = (customerCounts[customerId] || 0) + 1;
  });
  return Object.values(customerCounts).filter((count) => count > 1).length;
};

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("products"); // 'products' or 'orders'
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showAvatarGenerator, setShowAvatarGenerator] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [stock, setStock] = useState("");
  const [ecoMaterial, setEcoMaterial] = useState("");
  const [ecoCarbon, setEcoCarbon] = useState("");
  const [ecoRecycling, setEcoRecycling] = useState("");
  const [materialCost, setMaterialCost] = useState("");
  const [laborCost, setLaborCost] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [modelUrl, setModelUrl] = useState("");

  // AI State
  const [generating, setGenerating] = useState(false);
  const [predictingPrice, setPredictingPrice] = useState(false);
  const [priceSuggestion, setPriceSuggestion] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [strategyLoading, setStrategyLoading] = useState(false);
  const [strategyResult, setStrategyResult] = useState("");
  const [showStrategyModal, setShowStrategyModal] = useState(false);
  const [strategyProduct, setStrategyProduct] = useState(null);
  const [trendData, setTrendData] = useState(null);
  const [trendLoading, setTrendLoading] = useState(false);
  const [captionProduct, setCaptionProduct] = useState(null);
  const [captionData, setCaptionData] = useState(null);
  const [captionLoading, setCaptionLoading] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const [generatingName, setGeneratingName] = useState(false);
  const [nameSuggestions, setNameSuggestions] = useState([]);
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  // Analytics State
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalSales: 0,
    totalOrders: 0,
    avgRating: 0,
    monthlySales: [],
    topProducts: [],
    customerInsights: {},
  });
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const calculateAnalytics = useCallback((artisanProducts = [], orderData = []) => {
    const totalRevenue = orderData.reduce(
      (sum, order) => sum + (Number(order.totalPrice) || 0),
      0,
    );
    const totalOrders = orderData.length;
    const avgRating =
      artisanProducts.length > 0
        ? (
            artisanProducts.reduce((sum, product) => sum + (product.rating || 0), 0) /
            artisanProducts.length
          ).toFixed(1)
        : "0.0";

    const customerIds = orderData.map(getCustomerId).filter(Boolean);
    const customerInsights = {
      totalCustomers: new Set(customerIds).size,
      repeatCustomers: calculateRepeatCustomers(orderData),
      avgOrderValue:
        totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : "0.00",
    };

    setAnalytics({
      totalRevenue: totalRevenue.toFixed(2),
      totalSales: artisanProducts.reduce(
        (sum, product) => sum + (product.sales || 0),
        0,
      ),
      totalOrders,
      avgRating,
      monthlySales: generateMonthlySalesData(orderData),
      topProducts: [...artisanProducts]
        .sort((a, b) => (b.sales || 0) - (a.sales || 0))
        .slice(0, 5),
      customerInsights,
    });
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setAnalyticsLoading(true);
      try {
        // Fetch Products
        const { data: productData } = await axios.get(
          apiUrl(`/api/products`),
        );
        // Assume we only want this artisan's products (simplified for demo, usually filtered on backend)
        const artisanProducts = productData.filter(
          (p) => p.artisan?._id === user._id || p.artisan === user._id,
        );
        setProducts(artisanProducts);

        // Fetch Orders
        const config = {
          headers: { Authorization: `Bearer ${user.token}` },
        };
        const { data: orderData } = await axios.get(
          apiUrl('/api/orders/artisan'),
          config,
        );
        setOrders(orderData);

        // Fetch Commissions
        try {
          const { data: commissionData } = await axios.get(
            apiUrl('/api/commissions/artisan'),
            config,
          );
          setCommissions(commissionData);
        } catch (e) {
          console.error("Commissions fetch failed", e);
        }

        // Calculate Analytics
        calculateAnalytics(artisanProducts, orderData);
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setAnalyticsLoading(false);
      }
    };
    if (user) {
      fetchData();
      // Auto-fetch market trends for artisans
      setTrendLoading(true);
      axios
        .get(apiUrl('/api/ai/trend-forecast'), {
          headers: { Authorization: `Bearer ${user.token}` },
        })
        .then((res) => {
          if (res.data?.trends?.length > 0) setTrendData(res.data);
        })
        .catch(() => {})
        .finally(() => setTrendLoading(false));
    }
  }, [user, calculateAnalytics]);

  const handleGenerateDescription = async () => {
    if (!name || !category) {
      alert("Please enter Name and Category first to help the AI!");
      return;
    }
    setGenerating(true);
    try {
      const { data } = await axios.post(
        apiUrl('/api/products/generate-description'),
        {
          productName: name,
          category,
          keywords: "handmade, organic, premium",
        },
      );
      setDescription(data.description);
    } catch (error) {
      console.error(error);
      // Fallback for demo if backend fails
      setDescription(
        `(AI Generated) A stunning ${name} that captures the essence of ${category}. Carefully handcrafted using premium materials, this unique piece adds elegance and charm to any collection. Perfect for those who appreciate authentic artistry.`,
      );
    } finally {
      setGenerating(false);
    }
  };

  const handlePredictPrice = async () => {
    if (!category || !ecoMaterial) {
      alert(
        "Please enter Category and Material score to help the AI predict the price!",
      );
      return;
    }
    setPredictingPrice(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post(
        apiUrl('/api/ai/predict-price'),
        {
          category,
          material_cost: parseInt(ecoMaterial) * 5 || 20, // rough mockup
          labor_hours: 5,
        },
        config,
      );
      const suggestedPrice = data.suggested_price ?? data.suggestedPrice;
      setPriceSuggestion({ ...data, suggested_price: suggestedPrice });
      if (suggestedPrice) {
        setPrice(suggestedPrice);
      }
    } catch (error) {
      console.error("Price prediction failed", error);
      // Fallback for demo
      setPrice(85.5);
      setPriceSuggestion({
        suggested_price: 85.5,
        confidence: 0.9,
        breakdown: { base_cost: 35, category_premium: 120 },
      });
    } finally {
      setPredictingPrice(false);
    }
  };

  const handleGenerateName = async () => {
    if (!category) {
      alert("Please select a Category first!");
      return;
    }
    setGeneratingName(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post(
        apiUrl('/api/ai/product-name'),
        {
          category,
          description,
        },
        config,
      );
      setNameSuggestions(data.suggestions);
    } catch (error) {
      console.error("Name generation failed", error);
      setNameSuggestions([
        "Artisan Treasure",
        "Handcrafted Elegance",
        "Heritage Piece",
      ]);
    } finally {
      setGeneratingName(false);
    }
  };

  const handleAutoFillFromImage = async () => {
    if (!imageFile) return;
    setIsAutoFilling(true);
    try {
      const getBase64 = (file) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result);
          reader.onerror = (error) => reject(error);
        });
      };

      const base64data = await getBase64(imageFile);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post(
        apiUrl('/api/ai/auto-list'),
        {
          imageBase64: base64data,
        },
        config,
      );

      if (data.name) setName(data.name);
      if (data.category) setCategory(data.category);
      if (data.description) setDescription(data.description);
      if (data.price) setPrice(data.price);
    } catch (error) {
      console.error("Auto-Fill failed", error);
      alert(
        "Vision AI failed to analyze the image. Please fill out details manually.",
      );
    } finally {
      setIsAutoFilling(false);
    }
  };

  const handleVerifyHandmade = async () => {
    if (!name || !description) {
      alert(
        "Please provide a Product Name and Description first to verify authenticity.",
      );
      return;
    }
    setVerifying(true);
    setVerificationResult(null);

    try {
      const { data } = await axios.post(
        apiUrl('/api/ai/verify-handmade'),
        {
          name: name,
          description: description,
        },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );

      const fullData = data.fullData || data;
      setVerificationResult({
        isHandmadeVerified: data.isHandmadeVerified === true,
        handmadeAuthenticityScore: fullData.authenticityScore || data.authenticityScore || 95,
        handmadeReasoning: fullData.verificationResult || data.reasoning || "Verified by KalaKart AI",
        fullData,
      });
    } catch (error) {
      console.error("Verification failed", error);
      alert(
        "Verification service is temporarily unavailable. You can still list the product.",
      );
    } finally {
      setVerifying(false);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("category", category);
      formData.append("stock", stock);
      formData.append("ecoMaterial", ecoMaterial);
      formData.append("ecoCarbon", ecoCarbon);
      formData.append("ecoRecycling", ecoRecycling);
      formData.append("materialCost", materialCost);
      formData.append("laborCost", laborCost);
      formData.append("videoUrl", videoUrl);
      formData.append("modelUrl", modelUrl);
      formData.append("artisanId", user?._id);

      // Append Verification Data if it was processed
      if (verificationResult) {
        formData.append(
          "isHandmadeVerified",
          verificationResult.isHandmadeVerified,
        );
        formData.append(
          "handmadeAuthenticityScore",
          verificationResult.handmadeAuthenticityScore,
        );
        formData.append(
          "handmadeReasoning",
          verificationResult.handmadeReasoning,
        );
        if (
          verificationResult.fullData &&
          verificationResult.fullData.keyObservations
        ) {
          formData.append(
            "handmadeKeyObservations",
            JSON.stringify(verificationResult.fullData.keyObservations),
          );
        }
      }

      if (imageFile) {
        formData.append("image", imageFile);
      }

      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.post(
        apiUrl('/api/products'),
        formData,
        config,
      );

      setProducts([...products, data]);
      setShowAddForm(false);

      // Reset state
      setName("");
      setDescription("");
      setPrice("");
      setCategory("");
      setImageFile(null);
      setImagePreview("");
      setStock("");
      setEcoMaterial("");
      setEcoCarbon("");
      setEcoRecycling("");
      setMaterialCost("");
      setLaborCost("");
      setVideoUrl("");
      setModelUrl("");
      setVerificationResult(null);
    } catch (error) {
      console.error(error);
      alert("Failed to create product");
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      await axios.delete(
        apiUrl(`/api/products/${productId}`),
        config,
      );
      setProducts(products.filter((p) => p._id !== productId));
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete product. Please try again.");
    }
  };

  const handleEditClick = (product) => {
    setEditingProduct(product);
    setName(product.name);
    setDescription(product.description);
    setPrice(product.price);
    setCategory(product.category);
    setStock(product.stock);
    if (product.ecoScore) {
      setEcoMaterial(product.ecoScore.material);
      setEcoCarbon(product.ecoScore.carbon);
      setEcoRecycling(product.ecoScore.recycling);
    }
    if (product.transparency) {
      setMaterialCost(product.transparency.materialCost || "");
      setLaborCost(product.transparency.laborCost || "");
    } else {
      setMaterialCost("");
      setLaborCost("");
    }
    setVideoUrl(product.videoUrl || "");
    setModelUrl(product.modelUrl || "");
    setShowEditModal(true);
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const updatedData = {
        name,
        description,
        price: parseFloat(price),
        category,
        stock: parseInt(stock),
        ecoScore: {
          material: parseInt(ecoMaterial),
          carbon: parseInt(ecoCarbon),
          recycling: parseInt(ecoRecycling),
        },
        materialCost: parseFloat(materialCost),
        laborCost: parseFloat(laborCost),
        videoUrl,
        modelUrl,
      };
      const { data } = await axios.put(
        apiUrl(`/api/products/${editingProduct._id}`),
        updatedData,
        config,
      );
      setProducts(products.map((p) => (p._id === data._id ? data : p)));
      setShowEditModal(false);
      setEditingProduct(null);
      alert("Product updated successfully!");
    } catch (error) {
      console.error("Update failed:", error);
      alert("Failed to update product");
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.put(
        apiUrl(`/api/orders/${orderId}/status`),
        { status: newStatus },
        config,
      );
      setOrders(orders.map((o) => (o._id === data._id ? data : o)));
      alert(`Order marked as ${newStatus}`);
    } catch (error) {
      console.error("Status update failed:", error);
      alert("Failed to update order status");
    }
  };

  const handleUpdateCommissionStatus = async (id, status, finalPrice) => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };
      const { data } = await axios.put(
        apiUrl(`/api/commissions/${id}/status`),
        { status, finalPrice },
        config,
      );
      setCommissions(commissions.map((c) => (c._id === data._id ? data : c)));
      alert(`Commission ${status.toLowerCase()} successfully!`);
    } catch (error) {
      console.error("Commission update failed:", error);
      alert("Failed to update commission");
    }
  };

  const [photoTipsLoading, setPhotoTipsLoading] = useState(false);
  const [photoTips, setPhotoTips] = useState("");

  const handleGetPhotoTips = async (imageUrl) => {
    if (!imageUrl) return;
    setPhotoTipsLoading(true);
    setPhotoTips("");

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post(
        apiUrl('/api/ai/photo-tips'),
        { imageUrl },
        config,
      );
      setPhotoTips(
        data.tips ||
          "Use soft side lighting, crop closer, and keep the background simple so the handmade details stand out.",
      );
    } catch (error) {
      console.error("Photo tips failed:", error);
      setPhotoTips(
        "Use soft side lighting, crop closer, and keep the background simple so the handmade details stand out.",
      );
    } finally {
      setPhotoTipsLoading(false);
    }
  };

  const handleGetSalesStrategy = async (product) => {
    setStrategyProduct(product);
    setStrategyLoading(true);
    setStrategyResult("");
    setShowStrategyModal(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post(
        apiUrl('/api/ai/sales-strategy'),
        {
          productName: product.name,
          description: product.description,
          price: product.price,
          category: product.category,
        },
        config,
      );
      setStrategyResult(data.strategy);
    } catch (error) {
      console.error("Strategy failed:", error);
      setStrategyResult(
        "Our consultant is currently unavailable. Please focus on your craft and try again later!",
      );
    } finally {
      setStrategyLoading(false);
    }
  };

  const handleGetSocialCaption = async (product) => {
    setCaptionProduct(product);
    setCaptionData(null);
    setCaptionLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post(
        apiUrl('/api/ai/social-caption'),
        {
          productName: product.name,
          description: product.description,
          category: product.category,
          price: product.price,
        },
        config,
      );
      setCaptionData(data);
    } catch {
      setCaptionData({
        instagram: "Could not generate. Try again.",
        twitter: "Could not generate. Try again.",
      });
    } finally {
      setCaptionLoading(false);
    }
  };

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Drag and drop handlers for image
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      if (file.type.startsWith("image/")) {
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
      } else {
        alert("Please drop an image file");
      }
    }
  };

  if (!user || user.role !== "artisan") {
    return <AccessDenied />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 pb-6 border-b border-[#3E2723]/10">
        <div className="flex items-center gap-6">
          <div className="relative">
            {user?.profileImage ? (
              <img
                src={user.profileImage}
                alt="Artisan Profile"
                className="w-20 h-20 rounded-full object-cover shadow-lg border-4 border-white"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center font-bold text-3xl shadow-lg border-4 border-white">
                {user?.name?.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#3E2723]">
              Seller Dashboard
            </h1>
            <p className="text-[#8D6E63] mt-1 flex items-center gap-2">
              Welcome back, {user?.name}!
            </p>
            <button
              onClick={() => setShowAvatarGenerator(true)}
              className="mt-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-amber-100 text-amber-800 px-3 py-1.5 rounded-full border border-amber-200 hover:bg-amber-200 transition-all shadow-sm"
            >
              <Wand2 className="w-3 h-3" /> Generate Craft Identity
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4 mt-6 md:mt-0">
          <button
            onClick={() => setActiveTab("products")}
            className={`font-semibold pb-2 border-b-2 transition-colors ${activeTab === "products" ? "border-[#3E2723] text-[#3E2723]" : "border-transparent text-gray-500 hover:text-gray-700"}`}
          >
            My Products
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`font-semibold pb-2 border-b-2 transition-colors ${activeTab === "orders" ? "border-[#3E2723] text-[#3E2723]" : "border-transparent text-gray-500 hover:text-gray-700"}`}
          >
            Received Orders
          </button>
          <button
            onClick={() => setActiveTab("commissions")}
            className={`font-semibold pb-2 border-b-2 transition-colors ${activeTab === "commissions" ? "border-[#3E2723] text-[#3E2723]" : "border-transparent text-gray-500 hover:text-gray-700"}`}
          >
            Commissions
          </button>
        </div>
        {activeTab === "products" && (
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 btn-primary"
            >
              <Plus className="w-5 h-5" /> Add New Product
            </button>
          </div>
        )}
      </div>

      {/* AI Market Intelligence Panel */}
      {trendLoading && !trendData && (
        <div className="mb-8 bg-white rounded-2xl border border-amber-100 p-5 text-sm font-semibold text-amber-700 shadow-sm flex items-center gap-3">
          <Sparkles className="w-4 h-4 animate-spin" />
          Loading market intelligence...
        </div>
      )}
      {trendData && (
        <div className="mb-8 bg-gradient-to-br from-[#FFF8E1] to-white rounded-2xl border border-amber-200 shadow-sm overflow-hidden animate-fade-in">
          <div className="p-5 border-b border-amber-100 flex items-center justify-between bg-white/50">
            <div className="flex items-center gap-3">
              <div className="bg-amber-100 p-2 rounded-xl text-amber-700">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Market Intelligence
                </h2>
                <p className="text-xs text-amber-700 font-semibold uppercase tracking-wider">
                  Seasonal Forecast:{" "}
                  <span className="text-amber-900">{trendData.season}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-amber-100/50 rounded-full border border-amber-200">
              <Sparkles className="w-3 h-3 text-amber-600" />
              <span className="text-[10px] font-black text-amber-800 uppercase tracking-tighter">
                AI Powered
              </span>
            </div>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {trendData.trends.map((trend, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-xl p-4 border border-amber-50 shadow-sm hover:shadow-md transition-shadow group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{trend.emoji}</span>
                      <h3 className="font-bold text-gray-900 group-hover:text-amber-800 transition-colors">
                        {trend.category}
                      </h3>
                    </div>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                        trend.demand === "High"
                          ? "bg-red-100 text-red-700"
                          : trend.demand === "Growing"
                            ? "bg-green-100 text-green-700"
                            : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {trend.demand} Demand
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed font-medium">
                    {trend.insight}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Analytics Dashboard */}
      {activeTab === "products" && (
        <div className="mb-8 space-y-6 animate-fade-in">
          {analyticsLoading && (
            <div className="bg-white rounded-xl border border-gray-100 px-4 py-3 text-sm font-semibold text-gray-500 flex items-center gap-2 shadow-sm">
              <Sparkles className="w-4 h-4 animate-spin text-amber-500" />
              Refreshing dashboard metrics...
            </div>
          )}
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    Total Revenue
                  </p>
                  <h3 className="text-3xl font-bold text-gray-900 mt-2">
                    ₹{analytics.totalRevenue}
                  </h3>
                </div>
                <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                From {analytics.totalOrders} orders
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-white rounded-xl p-6 border border-green-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    Products Sold
                  </p>
                  <h3 className="text-3xl font-bold text-gray-900 mt-2">
                    {analytics.totalSales}
                  </h3>
                </div>
                <div className="bg-green-100 p-3 rounded-xl text-green-600">
                  <Package className="w-6 h-6" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                {products.length} products listed
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl p-6 border border-purple-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    Average Rating
                  </p>
                  <h3 className="text-3xl font-bold text-gray-900 mt-2">
                    ⭐ {analytics.avgRating}
                  </h3>
                </div>
                <div className="bg-purple-100 p-3 rounded-xl text-purple-600">
                  <Check className="w-6 h-6" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-4">Customer feedback</p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-white rounded-xl p-6 border border-orange-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    Avg Order Value
                  </p>
                  <h3 className="text-3xl font-bold text-gray-900 mt-2">
                    ₹{analytics.customerInsights.avgOrderValue}
                  </h3>
                </div>
                <div className="bg-orange-100 p-3 rounded-xl text-orange-600">
                  <Leaf className="w-6 h-6" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                {analytics.customerInsights.totalCustomers} customers
              </p>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sales Chart */}
            <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Sales Trend
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.monthlySales}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip className="bg-white p-2 rounded-lg border border-gray-200" />
                  <Bar dataKey="sales" fill="#8B4513" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Customer Insights */}
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Customer Insights
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Total Customers</span>
                  <span className="font-bold text-gray-900">
                    {analytics.customerInsights.totalCustomers}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">
                    Repeat Customers
                  </span>
                  <span className="font-bold text-green-600">
                    {analytics.customerInsights.repeatCustomers}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Total Orders</span>
                  <span className="font-bold text-gray-900">
                    {analytics.totalOrders}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Top Products */}
          {analytics.topProducts.length > 0 && (
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Top Performing Products
              </h3>
              <div className="space-y-3">
                {analytics.topProducts.map((product, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {product.images?.[0] && (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {product.name}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {product.category}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        {product.sales || 0} sold
                      </p>
                      <p className="text-xs text-gray-500">₹{product.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50 sticky top-0 z-10">
              <h2 className="text-xl font-bold text-gray-800">
                List a New Creation
              </h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-sm font-semibold text-gray-700">
                        Product Name
                      </label>
                      <button
                        type="button"
                        onClick={handleGenerateName}
                        disabled={generatingName || !category}
                        className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1 hover:text-blue-800 disabled:opacity-30 transition"
                      >
                        <Sparkles
                          className={`w-3 h-3 ${generatingName ? "animate-spin" : ""}`}
                        />
                        Generate AI Name
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full border-gray-300 rounded-lg focus:ring-primary focus:border-primary p-2.5 border"
                        placeholder="e.g. Handmade Ceramic Vase"
                        required
                      />
                      {nameSuggestions.length > 0 && (
                        <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-blue-100 rounded-xl shadow-xl overflow-hidden animate-fade-in">
                          <div className="p-2 border-b border-blue-50 bg-blue-50/30 flex justify-between items-center">
                            <span className="text-[9px] font-bold text-blue-700 uppercase">
                              AI Suggestions
                            </span>
                            <button
                              onClick={() => setNameSuggestions([])}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="max-h-40 overflow-y-auto">
                            {nameSuggestions.map((suggestion, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => {
                                  setName(suggestion);
                                  setNameSuggestions([]);
                                }}
                                className="w-full text-left px-4 py-2.5 text-xs hover:bg-blue-50 text-gray-700 transition"
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full border-gray-300 rounded-lg focus:ring-primary focus:border-primary p-2.5 border"
                      required
                    >
                      <option value="">Select Category</option>
                      <option value="Jewelry">Jewelry</option>
                      <option value="Pottery">Pottery</option>
                      <option value="Textiles">Textiles</option>
                      <option value="Home Decor">Home Decor</option>
                      <option value="Painting">Painting</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Price (₹)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          step="0.01"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          className="w-full border-gray-300 rounded-lg focus:ring-primary focus:border-primary p-2.5 border"
                          placeholder="0.00"
                          required
                        />
                        <button
                          type="button"
                          onClick={handlePredictPrice}
                          disabled={predictingPrice || !category}
                          title="AI Price Prediction"
                          className="bg-blue-100 text-blue-700 px-3 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center disabled:opacity-50"
                        >
                          <Sparkles
                            className={`w-4 h-4 ${predictingPrice ? "animate-spin" : ""}`}
                          />
                        </button>
                      </div>
                      {priceSuggestion && (
                        <p className="text-xs text-blue-600 mt-1 flex items-center gap-1 font-medium">
                          <Sparkles className="w-3 h-3" />
                          AI suggests ₹
                          {Number(priceSuggestion.suggested_price || 0).toFixed(2)}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Stock
                      </label>
                      <input
                        type="number"
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                        className="w-full border-gray-300 rounded-lg focus:ring-primary focus:border-primary p-2.5 border"
                        placeholder="1"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2 bg-green-50 p-4 rounded-xl border border-green-200 mt-4">
                    <h3 className="font-bold text-green-800 flex items-center gap-2">
                      <Leaf className="w-4 h-4" /> Sustainability Score
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-xs font-semibold text-green-700 mb-1">
                          Material (0-10)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={ecoMaterial}
                          onChange={(e) => setEcoMaterial(e.target.value)}
                          className="w-full border-green-300 rounded-lg p-2 border"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-green-700 mb-1">
                          Carbon (0-10)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={ecoCarbon}
                          onChange={(e) => setEcoCarbon(e.target.value)}
                          className="w-full border-green-300 rounded-lg p-2 border"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-green-700 mb-1">
                          Recycling (0-10)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={ecoRecycling}
                          onChange={(e) => setEcoRecycling(e.target.value)}
                          className="w-full border-green-300 rounded-lg p-2 border"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 bg-amber-50 p-4 rounded-xl border border-amber-200 mt-4">
                      <h3 className="font-bold text-amber-800 flex items-center gap-2">
                        <PieChartIcon className="w-4 h-4" /> Radical
                        Transparency
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-amber-700 mb-1">
                            Material Cost (₹)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={materialCost}
                            onChange={(e) => setMaterialCost(e.target.value)}
                            className="w-full border-amber-300 rounded-lg p-2 border focus:ring-amber-500 focus:border-amber-500"
                            placeholder="0.00"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-amber-700 mb-1">
                            Labor Cost (₹)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={laborCost}
                            onChange={(e) => setLaborCost(e.target.value)}
                            className="w-full border-amber-300 rounded-lg p-2 border focus:ring-amber-500 focus:border-amber-500"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                      <p className="text-xs text-amber-700/80 mt-2">
                        Entering these values builds trust with buyers by
                        showing exactly where their money goes.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        ✨ Product Image
                      </label>

                      {/* Drag and Drop Area */}
                      <div
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        className={`relative rounded-xl border-2 border-dashed p-6 text-center transition-all cursor-pointer ${
                          dragActive
                            ? "border-blue-500 bg-blue-50/50"
                            : "border-gray-300 bg-gray-50/50"
                        } hover:border-blue-400 hover:bg-blue-50/30`}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          id="imageInput"
                          required={!imageFile}
                        />
                        <label htmlFor="imageInput" className="cursor-pointer">
                          <div className="flex flex-col items-center gap-2">
                            <Upload
                              className={`w-8 h-8 ${dragActive ? "text-blue-600" : "text-gray-400"} transition-colors`}
                            />
                            <p className="text-sm font-semibold text-gray-700">
                              {dragActive
                                ? "Drop your image here"
                                : "Drag & drop image or click to select"}
                            </p>
                            <p className="text-xs text-gray-500">
                              PNG, JPG, WebP up to 10MB
                            </p>
                          </div>
                        </label>
                      </div>

                      {/* Image Preview */}
                      {imagePreview && (
                        <div className="space-y-3 mt-4 animate-fade-in">
                          <div className="relative rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                            <img
                              src={imagePreview}
                              alt="Product preview"
                              className="w-full h-48 object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setImageFile(null);
                                setImagePreview("");
                              }}
                              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full transition shadow-lg"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={handleAutoFillFromImage}
                            disabled={isAutoFilling}
                            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition transform hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            <Sparkles
                              className={`w-5 h-5 ${isAutoFilling ? "animate-spin" : "text-yellow-300"}`}
                            />
                            {isAutoFilling
                              ? "AI Vision is analyzing..."
                              : "Auto-fill details from image"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 bg-[#EFEBE9] p-6 rounded-xl border border-[#D7CCC8]">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-bold text-[#3E2723]">
                      Description
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateDescription}
                      disabled={generating}
                      className="flex items-center gap-2 bg-[#3E2723] text-white text-xs px-4 py-2 rounded-full font-bold shadow-md hover:shadow-lg transition transform hover:scale-105 disabled:opacity-50"
                    >
                      <Sparkles className="w-3 h-3" />
                      {generating ? "Magic Generating..." : "Generate with AI"}
                    </button>
                  </div>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 p-3 border h-32 text-sm"
                    placeholder="Describe your product manually or use our AI tool..."
                    required
                  />
                  <p className="text-xs text-purple-600 italic">
                    ✨ Tip: Enter a name and category, then hit 'Generate with
                    AI' to get an instant professional description!
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-indigo-50/30 p-6 rounded-xl border border-indigo-100">
                  <div>
                    <label className="block text-sm font-bold text-indigo-900 mb-1 flex items-center gap-2">
                      <PlayCircle className="w-4 h-4" /> Video Story URL
                      (YouTube/MP4)
                    </label>
                    <input
                      type="url"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      className="w-full border-indigo-200 rounded-lg p-2.5 border focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      placeholder="https://www.youtube.com/embed/..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-indigo-900 mb-1 flex items-center gap-2">
                      <Box className="w-4 h-4" /> 3D Model URL (.GLB)
                    </label>
                    <input
                      type="url"
                      value={modelUrl}
                      onChange={(e) => setModelUrl(e.target.value)}
                      className="w-full border-indigo-200 rounded-lg p-2.5 border focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      placeholder="https://path-to-your-model.glb"
                    />
                  </div>
                  <p className="text-[10px] text-indigo-700 md:col-span-2">
                    Adding video and 3D models increases buyer engagement by up
                    to 300%!
                  </p>
                </div>

                {/* Verification Section */}
                <div className="space-y-4 bg-blue-50/50 p-6 rounded-xl border border-blue-100">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <label className="block text-sm font-bold text-blue-900">
                        AI Authenticity Inspector
                      </label>
                      <p className="text-xs text-blue-700 mt-1">
                        Verify your item as handmade to build buyer trust.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleVerifyHandmade}
                      disabled={verifying || !name || !description}
                      className="flex items-center gap-2 bg-blue-600 text-white text-sm px-5 py-2.5 rounded-xl font-bold shadow-md hover:bg-blue-700 transition disabled:opacity-50"
                    >
                      {verifying ? (
                        <Sparkles className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                      {verifying ? "Inspecting..." : "Verify Handmade"}
                    </button>
                  </div>

                  {verificationResult && (
                    <div
                      className={`p-4 rounded-xl border ${verificationResult.isHandmadeVerified ? "bg-green-100 border-green-300" : "bg-orange-100 border-orange-300"} animate-fade-in`}
                    >
                      <div className="flex items-start gap-3">
                        {verificationResult.isHandmadeVerified ? (
                          <Sparkles className="w-6 h-6 text-green-700 shrink-0 mt-0.5" />
                        ) : (
                          <AlertCircle className="w-6 h-6 text-orange-700 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <h4
                            className={`font-bold text-lg ${verificationResult.isHandmadeVerified ? "text-green-800" : "text-orange-800"}`}
                          >
                            {verificationResult.fullData?.verificationResult ||
                              (verificationResult.isHandmadeVerified
                                ? "Verified Handmade"
                                : "Verification Pending")}
                          </h4>
                          <p
                            className={`text-sm mt-1 font-medium ${verificationResult.isHandmadeVerified ? "text-green-900" : "text-orange-900"}`}
                          >
                            Authenticity Score:{" "}
                            {verificationResult.handmadeAuthenticityScore}%
                          </p>
                          <p className="text-sm mt-2 text-gray-700 leading-relaxed bg-white/50 p-3 rounded-lg">
                            "{verificationResult.handmadeReasoning}"
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="w-full py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#3E2723] text-white font-bold hover:bg-[#8D6E63] shadow-lg shadow-[#3E2723]/25 transition"
                >
                  Publish Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50 sticky top-0 z-10">
              <h2 className="text-xl font-bold text-gray-800">
                Edit Your Creation
              </h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingProduct(null);
                }}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleUpdateProduct} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Product Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full border-gray-300 rounded-lg focus:ring-primary focus:border-primary p-2.5 border"
                      placeholder="e.g. Handmade Ceramic Vase"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full border-gray-300 rounded-lg focus:ring-primary focus:border-primary p-2.5 border"
                      required
                    >
                      <option value="">Select Category</option>
                      <option value="Jewelry">Jewelry</option>
                      <option value="Pottery">Pottery</option>
                      <option value="Textiles">Textiles</option>
                      <option value="Home Decor">Home Decor</option>
                      <option value="Painting">Painting</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Price (₹)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          step="0.01"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          className="w-full border-gray-300 rounded-lg focus:ring-primary focus:border-primary p-2.5 border"
                          placeholder="0.00"
                          required
                        />
                        <button
                          type="button"
                          onClick={handlePredictPrice}
                          disabled={predictingPrice || !category}
                          title="AI Price Prediction"
                          className="bg-blue-100 text-blue-700 px-3 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center disabled:opacity-50"
                        >
                          <Sparkles
                            className={`w-4 h-4 ${predictingPrice ? "animate-spin" : ""}`}
                          />
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Stock
                      </label>
                      <input
                        type="number"
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                        className="w-full border-gray-300 rounded-lg focus:ring-primary focus:border-primary p-2.5 border"
                        placeholder="1"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2 bg-green-50 p-4 rounded-xl border border-green-200 mt-4">
                    <h3 className="font-bold text-green-800 flex items-center gap-2">
                      <Leaf className="w-4 h-4" /> Sustainability Score
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={ecoMaterial}
                          onChange={(e) => setEcoMaterial(e.target.value)}
                          className="w-full border-green-300 rounded-lg p-2 border"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={ecoCarbon}
                          onChange={(e) => setEcoCarbon(e.target.value)}
                          className="w-full border-green-300 rounded-lg p-2 border"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={ecoRecycling}
                          onChange={(e) => setEcoRecycling(e.target.value)}
                          className="w-full border-green-300 rounded-lg p-2 border"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 bg-amber-50 p-4 rounded-xl border border-amber-200 mt-4">
                    <h3 className="font-bold text-amber-800 flex items-center gap-2">
                      <PieChartIcon className="w-4 h-4" /> Radical Transparency
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-amber-700 mb-1">
                          Material Cost (₹)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={materialCost}
                          onChange={(e) => setMaterialCost(e.target.value)}
                          className="w-full border-amber-300 rounded-lg p-2 border focus:ring-amber-500 focus:border-amber-500"
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-amber-700 mb-1">
                          Labor Cost (₹)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={laborCost}
                          onChange={(e) => setLaborCost(e.target.value)}
                          className="w-full border-amber-300 rounded-lg p-2 border focus:ring-amber-500 focus:border-amber-500"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-amber-700/80 mt-2">
                      Update costs to maintain buyer trust.
                    </p>
                  </div>

                  <div className="space-y-4 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 mt-4">
                    <h3 className="font-bold text-indigo-800 flex items-center gap-2">
                      <PlayCircle className="w-4 h-4" /> Multimedia Content
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-indigo-700 mb-1 uppercase tracking-wider">
                          Video URL
                        </label>
                        <input
                          type="url"
                          value={videoUrl}
                          onChange={(e) => setVideoUrl(e.target.value)}
                          className="w-full border-indigo-200 rounded-lg p-2 border focus:ring-indigo-500 focus:border-indigo-500 text-xs"
                          placeholder="YouTube/MP4 URL"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-indigo-700 mb-1 uppercase tracking-wider">
                          3D Model (.GLB)
                        </label>
                        <input
                          type="url"
                          value={modelUrl}
                          onChange={(e) => setModelUrl(e.target.value)}
                          className="w-full border-indigo-200 rounded-lg p-2 border focus:ring-indigo-500 focus:border-indigo-500 text-xs"
                          placeholder="Link to .glb file"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="aspect-video rounded-xl overflow-hidden bg-gray-100 border border-gray-200 relative">
                    <img
                      src={editingProduct.imageUrl}
                      alt={name}
                      className="w-full h-full object-cover"
                    />
                    <p className="absolute bottom-0 inset-x-0 text-[10px] text-center p-1 text-gray-500 bg-white/80">
                      Image cannot be changed during quick edit
                    </p>
                  </div>

                  <div className="bg-[#EFEBE9]/50 p-4 rounded-xl border border-[#D7CCC8] relative overflow-hidden">
                    <button
                      type="button"
                      onClick={() =>
                        handleGetPhotoTips(editingProduct.imageUrl)
                      }
                      disabled={photoTipsLoading}
                      className="w-full py-2 bg-[#3E2723] text-white text-[10px] font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-[#2D1B15] transition disabled:opacity-50"
                    >
                      {photoTipsLoading ? (
                        "Analyzing Lighting..."
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3 text-amber-300" />{" "}
                          Improve Photo with AI
                        </>
                      )}
                    </button>
                    {photoTips && (
                      <div className="mt-3 p-3 bg-white/70 rounded-lg text-[10px] text-[#3E2723] italic font-serif border border-white leading-relaxed animate-fade-in whitespace-pre-wrap">
                        {photoTips}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2 bg-[#EFEBE9] p-4 rounded-xl border border-[#D7CCC8]">
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-bold text-[#3E2723]">
                        AI Description
                      </label>
                      <button
                        type="button"
                        onClick={handleGenerateDescription}
                        disabled={generating}
                        className="bg-[#3E2723] text-white text-[10px] px-3 py-1 rounded-full font-bold shadow-sm hover:shadow-md transition disabled:opacity-50"
                      >
                        {generating ? "..." : "Re-generate"}
                      </button>
                    </div>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 p-2 border h-32 text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingProduct(null);
                  }}
                  className="w-full py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/25 transition"
                >
                  Update Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dashboard Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        <div className="lg:col-span-2 bg-[#EFEBE9]/30 rounded-2xl border border-[#3E2723]/10 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-[#3E2723] mb-6">
            Sales Activity
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: "Mon", sales: 120 },
                  { name: "Tue", sales: 250 },
                  { name: "Wed", sales: 180 },
                  { name: "Thu", sales: 300 },
                  { name: "Fri", sales: 450 },
                  { name: "Sat", sales: 380 },
                  { name: "Sun", sales: 200 },
                ]}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <XAxis
                  dataKey="name"
                  stroke="#8D6E63"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#8D6E63"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `₹${value}`}
                />
                <Tooltip
                  cursor={{ fill: "#D7CCC8", opacity: 0.4 }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    fontWeight: "bold",
                    color: "#3E2723",
                  }}
                />
                <Bar
                  dataKey="sales"
                  fill="#3E2723"
                  radius={[6, 6, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex-1 flex flex-col justify-center">
            <p className="text-gray-500 text-sm font-semibold mb-1">
              Total Revenue
            </p>
            <p className="text-4xl font-black text-[#3E2723] mb-2">₹1,250.00</p>
            <span className="inline-flex max-w-max items-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
              +12% this month
            </span>
          </div>
          <div className="bg-gradient-to-br from-[#3E2723] to-[#5D4037] rounded-2xl p-6 shadow-sm flex-1 flex flex-col justify-center text-white">
            <p className="text-white/80 text-sm font-medium mb-1">
              Active Listings
            </p>
            <p className="text-4xl font-black mb-2">{products.length}</p>
            <p className="text-sm font-medium text-white/90">
              Manage your inventory
            </p>
          </div>
        </div>
      </div>

      {activeTab === "products" && (
        <>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Your Products
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.length > 0 ? (
              products.map((product) => (
                <div
                  key={product._id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden border border-gray-100 group"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={product.imageUrl}
                      alt={`${product.name} product preview`}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  </div>
                  <div className="p-4 flex flex-col h-full">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 truncate">
                        {product.name}
                      </h3>
                      <div className="flex justify-between items-center mt-3">
                        <span className="text-primary font-bold">
                          ₹{product.price}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-1 rounded-full ${product.stock > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                        >
                          {product.stock > 0
                            ? `${product.stock} In Stock`
                            : "Out of Stock"}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-gray-100/80">
                      <button
                        onClick={() => handleGetSalesStrategy(product)}
                        className="w-full flex items-center justify-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 transition bg-blue-50 py-2.5 rounded-lg border border-blue-100 hover:border-blue-200"
                      >
                        <TrendingUp className="w-3.5 h-3.5" /> AI Growth
                        Strategy
                      </button>
                      <button
                        onClick={() => handleGetSocialCaption(product)}
                        className="w-full flex items-center justify-center gap-2 text-xs font-bold text-pink-600 hover:text-pink-700 transition bg-pink-50 py-2.5 rounded-lg border border-pink-100 hover:border-pink-200"
                      >
                        <Share2 className="w-3.5 h-3.5" /> AI Social Captions
                      </button>
                      <div className="flex flex-col gap-2 mt-2">
                        <Link
                          to={`/product/${product._id}?viewMode=3d`}
                          className="w-full flex items-center justify-center gap-2 text-xs font-bold text-[#3E2723] hover:text-[#3E2723] transition bg-gray-50 py-2 rounded-lg border border-gray-200 hover:border-gray-300"
                        >
                          <Box className="w-3.5 h-3.5" /> 3D Preview
                        </Link>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditClick(product)}
                            className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold text-gray-600 hover:text-[#3E2723] transition bg-gray-50 py-2 rounded-lg border border-gray-200 hover:border-gray-300"
                          >
                            <Edit className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product._id)}
                            className="flex items-center justify-center text-red-400 hover:text-red-600 transition bg-red-50 p-2 rounded-lg border border-red-100 hover:border-red-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-dashed border-gray-300">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">
                  No products listed yet. Start selling today!
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === "orders" && (
        <>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Recent Orders
          </h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {orders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="p-4 font-semibold text-gray-600">
                        Order ID
                      </th>
                      <th className="p-4 font-semibold text-gray-600">Date</th>
                      <th className="p-4 font-semibold text-gray-600">
                        Customer
                      </th>
                      <th className="p-4 font-semibold text-gray-600">
                        Items (Yours)
                      </th>
                      <th className="p-4 font-semibold text-gray-600">
                        Total Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orders.map((order) => (
                      <tr
                        key={order._id}
                        className="hover:bg-gray-50 transition"
                      >
                        <td className="p-4 text-sm font-mono text-gray-600">
                          {order._id.substring(0, 8)}...
                        </td>
                        <td className="p-4 text-sm text-gray-800">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-sm text-gray-800">
                          {order.user?.name || "Guest"}
                        </td>
                        <td className="p-4 text-sm text-gray-800">
                          {order.orderItems
                            .filter(
                              (item) => item.product?.artisan === user._id,
                            )
                            .map((item) => (
                              <div
                                key={item._id}
                                className="truncate max-w-[200px]"
                                title={item.name}
                              >
                                {item.qty}x {item.name}
                              </div>
                            ))}
                        </td>
                        <td className="p-4">
                          <select
                            value={order.status || "Paid"}
                            onChange={(e) =>
                              handleUpdateOrderStatus(order._id, e.target.value)
                            }
                            className={`text-xs font-bold px-3 py-1.5 rounded-full border-0 focus:ring-2 focus:ring-[#3E2723] cursor-pointer transition-colors shadow-sm
                                                            ${
                                                              order.status ===
                                                              "Delivered"
                                                                ? "bg-green-100 text-green-700"
                                                                : order.status ===
                                                                    "Shipped"
                                                                  ? "bg-blue-100 text-blue-700"
                                                                  : order.status ===
                                                                      "Processing"
                                                                    ? "bg-orange-100 text-orange-700"
                                                                    : "bg-purple-100 text-purple-700"
                                                            }`}
                          >
                            <option value="Paid">Received (Paid)</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-16 text-center">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">
                  No orders received yet. Keep promoting your products!
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === "commissions" && (
        <>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            Custom Commissions <Sparkles className="w-6 h-6 text-amber-500" />
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {commissions.length > 0 ? (
              commissions.map((comm) => (
                <div
                  key={comm._id}
                  className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full -mr-12 -mt-12 transition-all group-hover:bg-amber-500/10"></div>

                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 text-blue-600 p-2 rounded-xl">
                        <Package className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                          From {comm.buyer?.name}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {new Date(comm.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-sm
                                        ${
                                          comm.status === "Pending"
                                            ? "bg-amber-100 text-amber-700 border border-amber-200"
                                            : comm.status === "Accepted"
                                              ? "bg-green-100 text-green-700 border border-green-200"
                                              : comm.status === "Completed"
                                                ? "bg-blue-100 text-blue-700 border border-blue-200"
                                                : "bg-red-100 text-red-700 border border-red-200"
                                        }`}
                    >
                      {comm.status}
                    </span>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-700 leading-relaxed italic border-l-4 border-amber-200 pl-3">
                      "{comm.requestDetails}"
                    </p>
                  </div>

                  {comm.referenceImage && (
                    <div className="mb-4 rounded-2xl overflow-hidden border border-gray-100">
                      <img
                        src={comm.referenceImage}
                        alt="Reference"
                        className="w-full h-32 object-cover"
                      />
                    </div>
                  )}

                  <div className="bg-amber-50/50 rounded-2xl p-4 border border-amber-100 mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span className="text-xs font-black text-amber-800 uppercase tracking-widest">
                        AI Complexity Estimate
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center">
                        <p className="text-[9px] font-bold text-amber-600 uppercase">
                          Complexity
                        </p>
                        <p className="text-sm font-black text-amber-900">
                          {comm.aiEstimate?.complexity || "Medium"}
                        </p>
                      </div>
                      <div className="text-center border-x border-amber-200">
                        <p className="text-[9px] font-bold text-amber-600 uppercase">
                          Timeframe
                        </p>
                        <p className="text-sm font-black text-amber-900">
                          {comm.aiEstimate?.estimatedDays || 7} Days
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-[9px] font-bold text-amber-600 uppercase">
                          Suggested
                        </p>
                        <p className="text-sm font-black text-amber-900 whitespace-nowrap">
                          {comm.aiEstimate?.suggestedPriceRange || "₹ --"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {comm.status === "Pending" && (
                    <div className="space-y-3">
                      <div className="relative">
                        <input
                          type="number"
                          placeholder="Set your final quote (₹)"
                          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent transition shadow-inner"
                          id={`quote-${comm._id}`}
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const price = document.getElementById(
                              `quote-${comm._id}`,
                            ).value;
                            if (!price) return alert("Please enter a quote");
                            handleUpdateCommissionStatus(
                              comm._id,
                              "Accepted",
                              price,
                            );
                          }}
                          className="flex-1 bg-green-600 text-white font-bold py-2.5 rounded-xl text-sm shadow-md hover:bg-green-700 transition transform hover:scale-[1.02]"
                        >
                          Accept & Send Quote
                        </button>
                        <button
                          onClick={() =>
                            handleUpdateCommissionStatus(comm._id, "Declined")
                          }
                          className="px-4 py-2.5 bg-red-50 text-red-600 font-bold rounded-xl text-sm border border-red-100 hover:bg-red-100 transition"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  )}

                  {comm.status === "Accepted" && (
                    <div className="flex items-center justify-between bg-green-50 p-3 rounded-xl border border-green-100">
                      <div>
                        <p className="text-[9px] font-bold text-green-600 uppercase">
                          Your Quote
                        </p>
                        <p className="text-lg font-black text-green-900">
                          ₹{comm.finalPrice}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          handleUpdateCommissionStatus(comm._id, "Completed")
                        }
                        className="bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-green-700 transition shadow-sm"
                      >
                        Mark Completed
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center bg-white rounded-[2rem] border border-dashed border-gray-200">
                <Sparkles className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-400 uppercase tracking-widest">
                  No Bespoke Requests
                </h3>
                <p className="text-gray-400 mt-2">
                  Custom pieces will appear here when customers request them.
                </p>
              </div>
            )}
          </div>
        </>
      )}
      {/* AI Strategy Modal */}
      {showStrategyModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#3E2723]/60 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-white/20">
            <div className="bg-[#3E2723] p-8 text-white relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
              <button
                onClick={() => setShowStrategyModal(false)}
                className="absolute top-6 right-6 text-white/50 hover:text-white transition p-2 hover:bg-white/10 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-4 mb-2">
                <div className="p-3 bg-amber-500/20 rounded-2xl border border-amber-500/30">
                  <TrendingUp className="w-8 h-8 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-amber-50 leading-tight">
                    AI Sales Strategist
                  </h2>
                  <p className="text-amber-100/60 text-sm font-medium">
                    Growth Analysis for "{strategyProduct?.name}"
                  </p>
                </div>
              </div>
            </div>

            <div className="p-10 bg-[#FDFBF9]">
              {strategyLoading ? (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 border-4 border-[#3E2723]/10 border-t-amber-500 rounded-full animate-spin mb-6"></div>
                  <h3 className="text-xl font-bold text-[#3E2723]">
                    Consulting our retail experts...
                  </h3>
                  <p className="text-gray-500 text-sm mt-2">
                    Gemini is analyzing market trends and your product
                    narrative.
                  </p>
                </div>
              ) : (
                <div className="space-y-6 animate-slide-up">
                  <div className="bg-white p-6 rounded-3xl border border-[#D7CCC8]/30 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-1 h-full bg-amber-500/20 group-hover:bg-amber-500 transition-all"></div>
                    <h3 className="text-sm font-bold text-[#3E2723] uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />{" "}
                      Professional Verdict
                    </h3>
                    <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap italic font-serif">
                      {strategyResult}
                    </div>
                  </div>
                  <button
                    onClick={() => setShowStrategyModal(false)}
                    className="w-full py-4 bg-[#3E2723] text-white font-bold rounded-2xl hover:bg-[#2D1B15] transition shadow-lg shadow-[#3E2723]/20 flex items-center justify-center gap-2"
                  >
                    Apply Insights <Check className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* AI Social Caption Modal */}
      {captionProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-5 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Share2 className="w-5 h-5 text-white" />
                <div>
                  <h2 className="text-white font-black text-lg">
                    AI Social Captions
                  </h2>
                  <p className="text-pink-100 text-xs font-medium truncate max-w-[250px]">
                    {captionProduct.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setCaptionProduct(null);
                  setCaptionData(null);
                }}
                className="text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/20 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              {captionLoading && (
                <div className="flex items-center gap-3 py-6 justify-center">
                  <Sparkles className="w-5 h-5 text-pink-500 animate-spin" />
                  <span className="text-gray-500 font-medium">
                    Crafting captions for you…
                  </span>
                </div>
              )}
              {captionData && !captionLoading && (
                <>
                  {/* Instagram */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-black text-sm text-gray-800 flex items-center gap-1.5">
                        📸 Instagram
                      </span>
                      <button
                        onClick={() =>
                          handleCopy(captionData.instagram, "instagram")
                        }
                        className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition ${copiedField === "instagram" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600 hover:bg-pink-50 hover:text-pink-700"}`}
                      >
                        {copiedField === "instagram" ? (
                          <>
                            <Check className="w-3.5 h-3.5" /> Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" /> Copy
                          </>
                        )}
                      </button>
                    </div>
                    <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-4 border border-pink-100 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                      {captionData.instagram}
                    </div>
                  </div>
                  {/* Twitter / X */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-black text-sm text-gray-800 flex items-center gap-1.5">
                        𝕏 Twitter / X
                      </span>
                      <button
                        onClick={() =>
                          handleCopy(captionData.twitter, "twitter")
                        }
                        className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition ${copiedField === "twitter" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-700"}`}
                      >
                        {copiedField === "twitter" ? (
                          <>
                            <Check className="w-3.5 h-3.5" /> Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" /> Copy
                          </>
                        )}
                      </button>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-xl p-4 border border-blue-100 text-sm text-gray-800 leading-relaxed">
                      {captionData.twitter}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      <AvatarGenerator
        isOpen={showAvatarGenerator}
        onClose={() => setShowAvatarGenerator(false)}
        user={user}
      />
    </div>
  );
};

export default Dashboard;
