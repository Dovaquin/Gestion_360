import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useStore } from '../context/Store';

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { products, updateProduct, deleteProduct } = useStore();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const product = products.find(p => p.id === id);

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [stock, setStock] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  
  // State for the delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setSku(product.sku);
      setStock(product.stock.toString());
      setPrice(product.price.toString());
      setImageUrl(product.imageUrl);
    }
  }, [product]);

  if (!product) {
    return (
        <div className="flex flex-col min-h-screen bg-background-dark text-white items-center justify-center">
          <p className="text-lg font-medium mb-4">Producto no encontrado</p>
          <button onClick={() => navigate('/inventory')} className="text-primary hover:underline">
            Volver al inventario
          </button>
        </div>
    );
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setImageUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async () => {
    if (!name || !price) return;
    
    await updateProduct({
        ...product,
        name,
        sku,
        stock: parseInt(stock) || 0,
        price: parseFloat(price) || 0,
        imageUrl: imageUrl
    });
    navigate('/inventory');
  };

  const confirmDelete = async () => {
    await deleteProduct(product.id);
    navigate('/inventory', { replace: true });
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-dark group/design-root">
       {/* Top Bar */}
       <div className="sticky top-0 z-10 flex h-16 items-center border-b border-white/10 bg-background-dark px-4 justify-between">
            <Link to="/inventory" className="flex size-10 shrink-0 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10">
                <span className="material-symbols-outlined text-2xl">arrow_back</span>
            </Link>
            <h1 className="text-lg font-bold text-white">Editar Producto</h1>
            <button 
                type="button"
                onClick={() => setIsDeleteModalOpen(true)}
                className="flex size-10 shrink-0 items-center justify-center rounded-full text-red-400 transition-colors hover:bg-white/10 hover:text-red-300"
            >
                <span className="material-symbols-outlined text-2xl">delete</span>
            </button>
       </div>

       <main className="flex flex-1 flex-col p-4 pb-24">
         <div className="flex flex-col gap-y-6">
            {/* Image Preview & Upload */}
            <div className="flex justify-center py-4">
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="relative w-32 h-32 rounded-xl bg-cover bg-center border-2 border-white/10 shadow-lg cursor-pointer group overflow-hidden"
                    style={{ backgroundImage: `url(${imageUrl})` }}
                >
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <span className="material-symbols-outlined text-white text-3xl">edit</span>
                    </div>
                </div>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageChange} 
                    className="hidden" 
                    accept="image/*"
                />
            </div>

            {/* Name */}
            <label className="flex flex-col">
                <p className="text-base font-medium leading-normal text-white pb-2">Nombre del Producto</p>
                <input
                    className="flex h-14 w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg border-none bg-surface-dark p-4 text-base font-normal leading-normal text-white placeholder:text-white/30 focus:outline-0 focus:ring-2 focus:ring-primary transition-shadow"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </label>

            {/* SKU */}
             <label className="flex flex-col">
                <p className="text-base font-medium leading-normal text-white pb-2">SKU (Código)</p>
                <input
                    className="flex h-14 w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg border-none bg-surface-dark p-4 text-base font-normal leading-normal text-white placeholder:text-white/30 focus:outline-0 focus:ring-2 focus:ring-primary transition-shadow"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                />
            </label>

             <div className="flex gap-4">
                {/* Stock */}
                <label className="flex flex-col flex-1">
                    <p className="text-base font-medium leading-normal text-white pb-2">Stock Actual</p>
                    <input
                        className="flex h-14 w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg border-none bg-surface-dark p-4 text-base font-normal leading-normal text-white placeholder:text-white/30 focus:outline-0 focus:ring-2 focus:ring-primary transition-shadow"
                        type="number"
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                    />
                </label>

                 {/* Price */}
                <label className="flex flex-col flex-1">
                    <p className="text-base font-medium leading-normal text-white pb-2">Precio</p>
                    <div className="relative flex w-full items-center">
                        <span className="material-symbols-outlined absolute left-4 text-white/50">attach_money</span>
                        <input
                            className="flex h-14 w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg border-none bg-surface-dark py-4 pl-12 pr-4 text-base font-normal leading-normal text-white placeholder:text-white/30 focus:outline-0 focus:ring-2 focus:ring-primary transition-shadow"
                            inputMode="decimal"
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                        />
                    </div>
                </label>
             </div>
         </div>
       </main>

       {/* Footer Actions */}
       <div className="fixed bottom-0 left-0 right-0 border-t border-white/10 bg-background-dark/95 backdrop-blur-sm p-4 safe-pb z-20 flex justify-center">
            <div className="w-full max-w-md">
                <button
                    onClick={handleUpdate}
                    className="flex h-14 w-full items-center justify-center rounded-xl bg-primary text-base font-bold text-background-dark transition-all hover:bg-primary-dark active:scale-95"
                >
                    Guardar Cambios
                </button>
            </div>
       </div>

       {/* Custom Delete Confirmation Modal */}
       {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="w-full max-w-sm rounded-2xl bg-surface-dark border border-white/10 p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
              <div className="flex flex-col items-center text-center gap-4">
                 <div className="h-12 w-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl">warning</span>
                 </div>
                 <div>
                    <h3 className="text-lg font-bold text-white">¿Eliminar producto?</h3>
                    <p className="text-white/60 text-sm mt-1">
                       ¿Estás seguro de que quieres eliminar <strong>"{product.name}"</strong>? Esta acción no se puede deshacer.
                    </p>
                 </div>
                 <div className="flex gap-3 w-full mt-2">
                    <button 
                       onClick={() => setIsDeleteModalOpen(false)}
                       className="flex-1 rounded-xl bg-white/5 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10 active:scale-95"
                    >
                       Cancelar
                    </button>
                    <button 
                       onClick={confirmDelete}
                       className="flex-1 rounded-xl bg-red-500 py-3 text-sm font-bold text-white transition-colors hover:bg-red-600 active:scale-95"
                    >
                       Eliminar
                    </button>
                 </div>
              </div>
           </div>
        </div>
       )}
    </div>
  );
};

export default ProductDetails;