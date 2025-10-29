import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const AdminWineEditor = ({ wine, onSave, onClose, onDelete }) => {
  const [formData, setFormData] = useState({
    name: '',
    supermarket: '',
    wine_type: '',
    rating: '',
    description: '',
    image_urls: [],
    post_url: '',
    influencer_source: ''
  });
  
  const [newImageUrl, setNewImageUrl] = useState('');
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (wine) {
      setFormData({
        name: wine.name || '',
        supermarket: wine.supermarket || '',
        wine_type: wine.wine_type || '',
        rating: wine.rating || '',
        description: wine.description || '',
        image_urls: wine.image_urls || [],
        post_url: wine.post_url || '',
        influencer_source: wine.influencer_source || ''
      });
    }
  }, [wine]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setFormData(prev => ({
        ...prev,
        image_urls: [...prev.image_urls, newImageUrl.trim()]
      }));
      setNewImageUrl('');
    }
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      image_urls: prev.image_urls.filter((_, i) => i !== index)
    }));
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newImages = [...formData.image_urls];
    const draggedItem = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedItem);

    setFormData(prev => ({ ...prev, image_urls: newImages }));
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(wine.id, formData);
      onClose();
    } catch (error) {
      console.error('Error saving wine:', error);
      // Error - manual close (important to read)
      toast.error('Failed to save wine: ' + error.message, { duration: Infinity });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = async () => {
    if (window.confirm(`Are you sure you want to delete "${wine.name}"? This cannot be undone.`)) {
      try {
        await onDelete(wine.id);
        onClose();
      } catch (error) {
        console.error('Error deleting wine:', error);
        // Error - manual close (important to read)
        toast.error('Failed to delete wine: ' + error.message, { duration: Infinity });
      }
    }
  };

  if (!wine) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Edit Wine</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Wine Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-burgundy-500 focus:border-burgundy-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Supermarket *
              </label>
              <select
                name="supermarket"
                value={formData.supermarket}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-burgundy-500 focus:border-burgundy-500"
              >
                <option value="">Select...</option>
                <option value="Albert Heijn">Albert Heijn</option>
                <option value="Dirk">Dirk</option>
                <option value="HEMA">HEMA</option>
                <option value="LIDL">LIDL</option>
                <option value="Jumbo">Jumbo</option>
                <option value="ALDI">ALDI</option>
                <option value="Plus">Plus</option>
                <option value="Sligro">Sligro</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Wine Type *
              </label>
              <select
                name="wine_type"
                value={formData.wine_type}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-burgundy-500 focus:border-burgundy-500"
              >
                <option value="">Select...</option>
                <option value="red">Red</option>
                <option value="white">White</option>
                <option value="rose">Rosé</option>
                <option value="sparkling">Sparkling</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Influencer Source
              </label>
              <input
                type="text"
                name="influencer_source"
                value={formData.influencer_source}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-burgundy-500 focus:border-burgundy-500"
              />
            </div>
          </div>

          {/* Rating (Quote) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rating / Quote
            </label>
            <input
              type="text"
              name="rating"
              value={formData.rating}
              onChange={handleChange}
              placeholder="e.g., Voor deze val ik wel te paaien"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-burgundy-500 focus:border-burgundy-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-burgundy-500 focus:border-burgundy-500"
            />
          </div>

          {/* Post URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Post URL
            </label>
            <input
              type="url"
              name="post_url"
              value={formData.post_url}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-burgundy-500 focus:border-burgundy-500"
            />
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Images (drag to reorder)
            </label>
            
            {/* Image Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
              {formData.image_urls.map((url, index) => (
                <div
                  key={index}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className="relative group cursor-move border-2 border-gray-200 rounded-lg overflow-hidden hover:border-burgundy-400 transition-colors"
                  style={{ aspectRatio: '4/5' }}
                >
                  <img
                    src={url}
                    alt={`Wine ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remove image"
                  >
                    ×
                  </button>
                  <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1.5 py-0.5 rounded">
                    {index + 1}
                  </div>
                </div>
              ))}
            </div>

            {/* Add Image */}
            <div className="flex gap-2">
              <input
                type="url"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="Paste Cloudinary image URL..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-burgundy-500 focus:border-burgundy-500"
              />
              <button
                type="button"
                onClick={handleAddImage}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                Add
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Cloudinary URLs look like: https://res.cloudinary.com/.../image.jpg
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-4 border-t">
            <button
              type="button"
              onClick={handleDeleteClick}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Delete Wine
            </button>
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2 bg-burgundy-600 text-white rounded-md hover:bg-burgundy-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminWineEditor;

