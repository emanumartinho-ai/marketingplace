import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useCreateProduct, useListCategories, useListCountries } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Vender() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createProduct = useCreateProduct();
  const { data: categories } = useListCategories();
  const { data: countries } = useListCountries();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    currency: "EUR",
    country: "",
    category: "",
    imageUrl: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.country || !formData.category) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
      });
      return;
    }

    createProduct.mutate(
      { 
        data: {
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          currency: formData.currency,
          country: formData.country,
          category: formData.category,
          imageUrl: formData.imageUrl || undefined
        }
      },
      {
        onSuccess: (product) => {
          toast({
            title: "Sucesso",
            description: "Anúncio criado com sucesso.",
          });
          setLocation(`/products/${product.id}`);
        },
        onError: () => {
          toast({
            variant: "destructive",
            title: "Erro",
            description: "Ocorreu um erro ao criar o anúncio.",
          });
        }
      }
    );
  };

  return (
    <div className="container max-w-2xl mx-auto px-4 py-12">
      <h1 className="font-serif text-3xl font-bold mb-8">Criar Novo Anúncio</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Título do Produto *</Label>
            <Input 
              id="name" 
              name="name" 
              placeholder="Ex: Ténis Vintage" 
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea 
              id="description" 
              name="description" 
              placeholder="Descreva o seu produto em detalhe..." 
              value={formData.description}
              onChange={handleChange}
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Preço *</Label>
              <Input 
                id="price" 
                name="price" 
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00" 
                value={formData.price}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Moeda *</Label>
              <Select value={formData.currency} onValueChange={(val) => handleSelectChange("currency", val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="AOA">AOA (Kz)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Categoria *</Label>
              <Select value={formData.category} onValueChange={(val) => handleSelectChange("category", val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map(c => (
                    <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">País de Origem *</Label>
              <Select value={formData.country} onValueChange={(val) => handleSelectChange("country", val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {countries?.map(c => (
                    <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">URL da Imagem</Label>
            <Input 
              id="imageUrl" 
              name="imageUrl" 
              placeholder="https://..." 
              value={formData.imageUrl}
              onChange={handleChange}
            />
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full" 
          disabled={createProduct.isPending}
        >
          {createProduct.isPending ? "A publicar..." : "Publicar Anúncio"}
        </Button>
      </form>
    </div>
  );
}
