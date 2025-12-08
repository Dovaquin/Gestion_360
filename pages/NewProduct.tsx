import React, { useState, useRef } from 'react';
import { useStore } from '../context/Store';
import { useNavigate, Link } from 'react-router-dom';

const NewProduct: React.FC = () => {
  const { addProduct } = useStore();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [stock, setStock] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState<string>('');

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

  const handleSubmit = () => {
    if (!name || !price) return;

    addProduct({
        id: Date.now().toString(),
        name,
        sku: sku || `SKU-${Date.now()}`,
        stock: parseInt(stock) || 0,
        price: parseFloat(price) || 0,
        imageUrl: imageUrl || `https://picsum.photos/200/200?random=${Date.now()}`
    });

    navigate('/inventory');
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-dark group/design-root">
       {/* Top Bar */}
       <div className="sticky top-0 z-10 flex h-16 items-center border-b border-white/10 bg-background-dark px-4">
            <Link to="/inventory" className="flex size-10 shrink-0 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10">
                <span className="material-symbols-outlined text-2xl">close</span>
            </Link>
            <h1 className="flex-1 text-center text-lg font-bold text-white">Nuevo Producto</h1>
            <div className="w-10"></div>
       </div>

       <main className="flex flex-1 flex-col p-4 pb-24">
         <div className="flex flex-col gap-y-6">
            
            {/* Image Upload */}
            <div className="flex justify-center py-2">
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="relative w-32 h-32 rounded-xl bg-surface-dark border-2 border-dashed border-white/20 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-white/5 transition-all overflow-hidden"
                >
                    {imageUrl ? (
                        <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                        <>
                            <span className="material-symbols-outlined text-3xl text-white/50 mb-1">add_a_photo</span>
                            <span className="text-xs text-white/50 font-medium">Agregar foto</span>
                        </>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                         <span className="material-symbols-outlined text-white text-2xl">edit</span>
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
                    placeholder="ej. Taza de Café"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoFocus
                />
            </label>

            {/* SKU */}
             <label className="flex flex-col">
                <p className="text-base font-medium leading-normal text-white pb-2">SKU (Código)</p>
                <input
                    className="flex h-14 w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg border-none bg-surface-dark p-4 text-base font-normal leading-normal text-white placeholder:text-white/30 focus:outline-0 focus:ring-2 focus:ring-primary transition-shadow"
                    placeholder="ej. SKU-123"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                />
            </label>

             <div className="flex gap-4">
                {/* Stock */}
                <label className="flex flex-col flex-1">
                    <p className="text-base font-medium leading-normal text-white pb-2">Stock Inicial</p>
                    <input
                        className="flex h-14 w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg border-none bg-surface-dark p-4 text-base font-normal leading-normal text-white placeholder:text-white/30 focus:outline-0 focus:ring-2 focus:ring-primary transition-shadow"
                        type="number"
                        placeholder="0"
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
                            placeholder="0.00"
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
                    onClick={handleSubmit}
                    className="flex h-14 w-full items-center justify-center rounded-xl bg-primary text-base font-bold text-background-dark transition-all hover:bg-primary-dark active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                    disabled={!name || !price}
                >
                    Guardar Producto
                </button>
            </div>
       </div>
    </div>
  );
};

export default NewProduct;