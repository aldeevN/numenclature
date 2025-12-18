import { useState, ChangeEvent, useEffect, useMemo, useRef } from 'react';

interface FieldValues {
  name: string;
  brand: string;
}

interface ModelYearPair {
  carBrand: string;
  model: string;
  yearFrom: string;
  yearTo: string;
  id: string;
  keepUppercase?: boolean;
}

interface ValidationErrors {
  yearFrom?: string;
  yearTo?: string;
  doubleSpaces?: string;
}

interface OilSpecification {
  type: string;
  brand: string;
  viscosity: string;
  specification: string;
  volume: string;
}

interface OilValidationErrors {
  [key: string]: {
    doubleSpaces?: string;
  };
}

interface HistoryItem {
  id: string;
  timestamp: number;
  result: string;
  mode: 'parts' | 'oils';
  data: {
    fields: FieldValues;
    modelYearPairs?: ModelYearPair[];
    oilSpec?: OilSpecification;
  };
}

// Компонент для снежинок
const Snowfall = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const snowflakes = useRef<any[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Настройка размера canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Создание снежинок
    const createSnowflakes = () => {
      snowflakes.current = [];
      const count = Math.min(100, Math.floor(window.innerWidth / 10));

      for (let i = 0; i < count; i++) {
        snowflakes.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 4 + 1,
          speed: Math.random() * 1 + 0.5,
          opacity: Math.random() * 0.5 + 0.3,
          wind: Math.random() * 0.5 - 0.25,
          swing: Math.random() * 0.05,
          swingOffset: Math.random() * Math.PI * 2
        });
      }
    };

    createSnowflakes();

    // Анимация снежинок
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      snowflakes.current.forEach(flake => {
        // Обновление позиции
        flake.y += flake.speed;
        flake.x += flake.wind + Math.sin(flake.swingOffset) * flake.swing;
        flake.swingOffset += 0.02;

        // Если снежинка упала за нижнюю границу
        if (flake.y > canvas.height) {
          flake.y = -10;
          flake.x = Math.random() * canvas.width;
        }

        // Если снежинка вышла за боковые границы
        if (flake.x > canvas.width + 10) {
          flake.x = -10;
        } else if (flake.x < -10) {
          flake.x = canvas.width + 10;
        }

        // Рисование снежинки
        ctx.beginPath();
        ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${flake.opacity})`;
        ctx.fill();

        // Добавляем свечение для больших снежинок
        if (flake.radius > 2) {
          ctx.beginPath();
          ctx.arc(flake.x, flake.y, flake.radius * 1.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${flake.opacity * 0.3})`;
          ctx.fill();
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: 'transparent' }}
    />
  );
};

// Компонент для новогодних украшений
const ChristmasDecorations = () => {
  return (
    <>
      {/* Гирлянды по краям */}
      <div className="fixed top-0 left-0 right-0 h-1 z-10">
        <div className="flex justify-between">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="w-4 h-4 rounded-full animate-pulse"
              style={{
                animationDelay: `${i * 0.2}s`,
                backgroundColor: i % 3 === 0 ? '#ef4444' : i % 3 === 1 ? '#22c55e' : '#3b82f6'
              }}
            />
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 h-1 z-10">
        <div className="flex justify-between">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="w-4 h-4 rounded-full animate-pulse"
              style={{
                animationDelay: `${i * 0.2 + 0.1}s`,
                backgroundColor: i % 3 === 0 ? '#3b82f6' : i % 3 === 1 ? '#ef4444' : '#22c55e'
              }}
            />
          ))}
        </div>
      </div>

      {/* Новогодние иконки */}
      <div className="fixed top-4 left-4 z-10">
        <div className="text-3xl animate-bounce">🎄</div>
      </div>
      <div className="fixed top-4 right-4 z-10">
        <div className="text-3xl animate-bounce" style={{ animationDelay: '0.5s' }}>🎅</div>
      </div>
      <div className="fixed bottom-4 left-4 z-10">
        <div className="text-3xl animate-bounce" style={{ animationDelay: '1s' }}>🦌</div>
      </div>
      <div className="fixed bottom-4 right-4 z-10">
        <div className="text-3xl animate-bounce" style={{ animationDelay: '1.5s' }}>🎁</div>
      </div>

      {/* Плавающие снежинки-украшения */}
      {[...Array(8)].map((_, i) => {
        const size = Math.random() * 24 + 16;
        const left = Math.random() * 80 + 10;
        const top = Math.random() * 80 + 10;
        const duration = Math.random() * 20 + 10;
        const delay = Math.random() * 5;

        return (
          <div
            key={i}
            className="fixed text-2xl opacity-30 z-0"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              fontSize: `${size}px`,
              animation: `float ${duration}s linear infinite`,
              animationDelay: `${delay}s`
            }}
          >
            ❄️
          </div>
        );
      })}
    </>
  );
};

export default function App() {
  const [mode, setMode] = useState<'parts' | 'oils'>('parts');
  const [fields, setFields] = useState<FieldValues>({
    name: '',
    brand: '',
  });
  const [modelYearPairs, setModelYearPairs] = useState<ModelYearPair[]>([
    { carBrand: '', model: '', yearFrom: '', yearTo: '', id: Date.now().toString() + '-0', keepUppercase: false }
  ]);
  const [oilSpec, setOilSpec] = useState<OilSpecification>({
    type: 'Моторное',
    brand: 'HYUNDAI/XTeer',
    viscosity: '15w40',
    specification: 'HD 7000 CI-4',
    volume: '1л'
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, ValidationErrors>>({});
  const [oilValidationErrors, setOilValidationErrors] = useState<OilValidationErrors>({});
  const [copySuccess, setCopySuccess] = useState<string>('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showAutocomplete, setShowAutocomplete] = useState<{
    field: string;
    values: string[];
    position: { top: number; left: number };
  } | null>(null);

  // Добавляем CSS анимации для снега
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes float {
        0% {
          transform: translateY(0) rotate(0deg);
          opacity: 0.3;
        }
        50% {
          opacity: 0.6;
        }
        100% {
          transform: translateY(100vh) rotate(360deg);
          opacity: 0.3;
        }
      }
      
      .christmas-title {
        background: linear-gradient(45deg, #ef4444, #22c55e, #3b82f6);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
      }
      
      .christmas-border {
        border-image: linear-gradient(45deg, #ef4444, #22c55e, #3b82f6) 1;
        box-shadow: 0 0 20px rgba(59, 130, 246, 0.2);
      }
      
      .snow-overlay {
        background: linear-gradient(to bottom, rgba(30, 58, 138, 0.1), transparent);
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Загружаем историю из localStorage при загрузке
  useEffect(() => {
    const savedHistory = localStorage.getItem('carPartsHistory');
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        // Сортируем по времени (новые сверху)
        const sortedHistory = parsedHistory.sort((a: HistoryItem, b: HistoryItem) => b.timestamp - a.timestamp);
        setHistory(sortedHistory);
      } catch (error) {
        console.error('Ошибка загрузки истории:', error);
      }
    }
  }, []);

  // Сохраняем историю в localStorage при изменении
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem('carPartsHistory', JSON.stringify(history));
    }
  }, [history]);

  // Функция для добавления результата в историю
  const addToHistory = (result: string) => {
    if (!result || result === 'Пожалуйста, исправьте ошибки валидации') {
      return;
    }

    const newHistoryItem: HistoryItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      result,
      mode,
      data: {
        fields: mode === 'parts' ? { ...fields } : { name: '', brand: '' }, // Only save fields for parts mode
        modelYearPairs: mode === 'parts' ? [...modelYearPairs] : undefined,
        oilSpec: mode === 'oils' ? { ...oilSpec } : undefined
      }
    };

    setHistory(prev => {
      const newHistory = [newHistoryItem, ...prev];
      // Ограничиваем историю 50 записями
      return newHistory.slice(0, 50);
    });
  };

  // Функция для применения истории к текущим полям
  const applyHistoryItem = (item: HistoryItem) => {
    setMode(item.mode);

    if (item.mode === 'parts' && item.data.fields) {
      setFields(item.data.fields);
    }

    if (item.mode === 'oils') {
      // Don't apply name and brand fields for oils mode
      setFields({
        name: '',
        brand: '',
      });
    }

    if (item.mode === 'parts' && item.data.modelYearPairs) {
      setModelYearPairs(item.data.modelYearPairs);
    }

    if (item.mode === 'oils' && item.data.oilSpec) {
      setOilSpec(item.data.oilSpec);
    }

    setShowHistory(false);
  };

  // Функция для очистки истории
  const clearHistory = () => {
    if (confirm('Вы уверены, что хотите очистить всю историю?')) {
      setHistory([]);
      localStorage.removeItem('carPartsHistory');
    }
  };

  // Получаем уникальные значения для автозаполнения из истории
  const autocompleteValues = useMemo(() => {
    const values: Record<string, Set<string>> = {
      name: new Set(),
      brand: new Set(),
      carBrand: new Set(),
      model: new Set(),
      oilType: new Set(),
      oilBrand: new Set(),
      oilViscosity: new Set(),
      oilSpecification: new Set(),
      oilVolume: new Set()
    };

    history.forEach(item => {
      if (item.data.fields.name) values.name.add(item.data.fields.name);
      if (item.data.fields.brand) values.brand.add(item.data.fields.brand);

      if (item.mode === 'parts' && item.data.modelYearPairs) {
        item.data.modelYearPairs.forEach(pair => {
          if (pair.carBrand) values.carBrand.add(pair.carBrand);
          if (pair.model) values.model.add(pair.model);
        });
      }

      if (item.mode === 'oils' && item.data.oilSpec) {
        const { type, brand, viscosity, specification, volume } = item.data.oilSpec;
        if (type) values.oilType.add(type);
        if (brand) values.oilBrand.add(brand);
        if (viscosity) values.oilViscosity.add(viscosity);
        if (specification) values.oilSpecification.add(specification);
        if (volume) values.oilVolume.add(volume);
      }
    });

    // Преобразуем Set в массивы и фильтруем пустые значения
    const result: Record<string, string[]> = {};
    Object.keys(values).forEach(key => {
      const arr = Array.from(values[key as keyof typeof values]).filter(val => val.trim() !== '');
      if (arr.length > 0) {
        result[key] = arr;
      }
    });

    return result;
  }, [history]);

  // Функция для форматирования
  const capitalizeWords = (str: string): string => {
    if (str.length === 0) return str;

    const words = str.split(' ');
    const result: string[] = [];

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      if (word.length === 0) {
        result.push('');
        continue;
      }

      if (i === 0) {
        result.push(word.charAt(0).toUpperCase() + word.slice(1));
      } else {
        result.push(word);
      }
    }

    return result.join(' ');
  };

  const formatCarBrand = (str: string, keepUppercase: boolean = false): string => {
    if (str.length === 0) return str;

    if (keepUppercase) {
      return str.trim().replace(/\s{2,}/g, ' ');
    }

    return str
      .trim()
      .split(' ')
      .filter(word => word.length > 0)
      .map((word, index) => {
        if (index === 0) {
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }
        return word;
      })
      .join(' ');
  };

  const formatFieldValue = (value: string): string => {
    return capitalizeWords(value);
  };

  // Функция для проверки двойных пробелов
  const checkDoubleSpaces = (value: string): boolean => {
    return /\s{2,}/.test(value);
  };

  const handleChange = (field: keyof FieldValues, value: string, event?: ChangeEvent<HTMLInputElement>) => {
    const singleSpacedValue = value.replace(/\s{2,}/g, ' ');
    const formattedValue = formatFieldValue(singleSpacedValue);
    setFields(prev => ({ ...prev, [field]: formattedValue }));

    // Проверяем двойные пробелы
    if (checkDoubleSpaces(value)) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: {
          ...prev[field],
          doubleSpaces: 'Обнаружены двойные пробелы. Они будут автоматически удалены.'
        }
      }));
    } else {
      setValidationErrors(prev => ({
        ...prev,
        [field]: {
          ...prev[field],
          doubleSpaces: undefined
        }
      }));
    }

    // Показываем автозаполнение если есть совпадения
    if (event && value.trim() !== '') {
      const fieldKey = field === 'name' ? 'name' : 'brand';
      const suggestions = autocompleteValues[fieldKey]?.filter(v =>
        v.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 5);

      if (suggestions && suggestions.length > 0) {
        const inputRect = event.target.getBoundingClientRect();
        setShowAutocomplete({
          field: fieldKey,
          values: suggestions,
          position: {
            top: inputRect.bottom + window.scrollY,
            left: inputRect.left + window.scrollX
          }
        });
      } else {
        setShowAutocomplete(null);
      }
    } else {
      setShowAutocomplete(null);
    }
  };

  const handleOilSpecChange = (field: keyof OilSpecification, value: string, event?: ChangeEvent<HTMLInputElement>) => {
    const singleSpacedValue = value.replace(/\s{2,}/g, ' ');
    setOilSpec(prev => ({ ...prev, [field]: singleSpacedValue }));

    // Проверяем двойные пробелы
    if (checkDoubleSpaces(value)) {
      setOilValidationErrors(prev => ({
        ...prev,
        [field]: {
          doubleSpaces: 'Обнаружены двойные пробелы. Они будут автоматически удалены.'
        }
      }));
    } else {
      setOilValidationErrors(prev => ({
        ...prev,
        [field]: {
          doubleSpaces: undefined
        }
      }));
    }

    // Показываем автозаполнение если есть совпадения
    if (event && value.trim() !== '') {
      const fieldKey = `oil${field.charAt(0).toUpperCase() + field.slice(1)}`;
      const suggestions = autocompleteValues[fieldKey]?.filter(v =>
        v.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 5);

      if (suggestions && suggestions.length > 0) {
        const inputRect = event.target.getBoundingClientRect();
        setShowAutocomplete({
          field: fieldKey,
          values: suggestions,
          position: {
            top: inputRect.bottom + window.scrollY,
            left: inputRect.left + window.scrollX
          }
        });
      } else {
        setShowAutocomplete(null);
      }
    } else {
      setShowAutocomplete(null);
    }
  };

  const validateYear = (year: string): string | null => {
    if (year.trim() === '') return null;

    const yearRegex = /^\d{2}$|^\d{4}$/;
    if (!yearRegex.test(year)) {
      return 'Год должен состоять из 2 или 4 цифр';
    }

    const yearNum = parseInt(year, 10);
    if (year.length === 4 && (yearNum < 1900 || yearNum > 2100)) {
      return 'Некорректный год';
    }

    if (year.length === 2 && (yearNum < 0 || yearNum > 99)) {
      return 'Некорректный год';
    }

    return null;
  };

  const formatYearForDisplay = (year: string): string => {
    if (year.trim() === '') return '';

    const trimmedYear = year.trim();
    if (trimmedYear.length === 4) {
      return trimmedYear.slice(-2);
    }
    return trimmedYear;
  };

  const handleModelChange = (id: string, field: 'carBrand' | 'model' | 'yearFrom' | 'yearTo', value: string, event?: ChangeEvent<HTMLInputElement>) => {
    let formattedValue = value;

    if (field === 'carBrand') {
      const singleSpacedValue = value.replace(/\s{2,}/g, ' ');
      const pair = modelYearPairs.find(p => p.id === id);
      formattedValue = formatCarBrand(singleSpacedValue, pair?.keepUppercase);

      // Проверяем двойные пробелы
      if (checkDoubleSpaces(value)) {
        setValidationErrors(prev => ({
          ...prev,
          [id]: {
            ...prev[id],
            doubleSpaces: 'Обнаружены двойные пробелы. Они будут автоматически удалены.'
          }
        }));
      } else {
        setValidationErrors(prev => ({
          ...prev,
          [id]: {
            ...prev[id],
            doubleSpaces: undefined
          }
        }));
      }

      // Показываем автозаполнение если есть совпадения
      if (event && value.trim() !== '' && field === 'carBrand') {
        const suggestions = autocompleteValues.carBrand?.filter(v =>
          v.toLowerCase().includes(value.toLowerCase())
        ).slice(0, 5);

        if (suggestions && suggestions.length > 0) {
          const inputRect = event.target.getBoundingClientRect();
          setShowAutocomplete({
            field: 'carBrand',
            values: suggestions,
            position: {
              top: inputRect.bottom + window.scrollY,
              left: inputRect.left + window.scrollX
            }
          });
        } else {
          setShowAutocomplete(null);
        }
      }
    } else if (field === 'model') {
      const singleSpacedValue = value.replace(/\s{2,}/g, ' ');
      // Check if this pair has keepUppercase enabled
      const pair = modelYearPairs.find(p => p.id === id);
      if (pair?.keepUppercase) {
        formattedValue = singleSpacedValue; // Keep as is for uppercase mode
      } else {
        formattedValue = formatFieldValue(singleSpacedValue);
      }

      // Проверяем двойные пробелы
      if (checkDoubleSpaces(value)) {
        setValidationErrors(prev => ({
          ...prev,
          [id]: {
            ...prev[id],
            doubleSpaces: 'Обнаружены двойные пробелы. Они будут автоматически удалены.'
          }
        }));
      }

      // Показываем автозаполнение если есть совпадения
      if (event && value.trim() !== '' && field === 'model') {
        const suggestions = autocompleteValues.model?.filter(v =>
          v.toLowerCase().includes(value.toLowerCase())
        ).slice(0, 5);

        if (suggestions && suggestions.length > 0) {
          const inputRect = event.target.getBoundingClientRect();
          setShowAutocomplete({
            field: 'model',
            values: suggestions,
            position: {
              top: inputRect.bottom + window.scrollY,
              left: inputRect.left + window.scrollX
            }
          });
        } else {
          setShowAutocomplete(null);
        }
      }
    } else {
      setShowAutocomplete(null);
    }

    if (field === 'yearFrom' || field === 'yearTo') {
      const error = validateYear(value);
      setValidationErrors(prev => ({
        ...prev,
        [id]: {
          ...prev[id],
          [field]: error || undefined
        }
      }));
    }

    setModelYearPairs(prev =>
      prev.map(pair =>
        pair.id === id ? { ...pair, [field]: formattedValue } : pair
      )
    );
  };

  const toggleUppercaseMode = (id: string) => {
    setModelYearPairs(prev =>
      prev.map(pair =>
        pair.id === id
          ? {
            ...pair,
            keepUppercase: !pair.keepUppercase,
            carBrand: formatCarBrand(pair.carBrand, !pair.keepUppercase),
            model: pair.keepUppercase ? formatFieldValue(pair.model) : pair.model // Apply formatting when turning off CAPS
          }
          : pair
      )
    );
  };

  const addModelYearPair = () => {
    setModelYearPairs(prev => [
      ...prev,
      { carBrand: '', model: '', yearFrom: '', yearTo: '', id: Date.now().toString() + '-' + prev.length, keepUppercase: false }
    ]);
  };

  const removeModelYearPair = (id: string) => {
    if (modelYearPairs.length > 1) {
      setModelYearPairs(prev => prev.filter(pair => pair.id !== id));
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
  };

  const copyToClipboard = async () => {
    if (!concatenatedResult || concatenatedResult === 'Пожалуйста, исправьте ошибки валидации') {
      return;
    }

    try {
      const cleanedResult = concatenatedResult.replace(/\s{2,}/g, ' ');
      await navigator.clipboard.writeText(cleanedResult);
      setCopySuccess('Скопировано в буфер обмена!');

      // Добавляем в историю после копирования
      addToHistory(cleanedResult);

      // Clear all inputs after successful copy
      if (mode === 'parts') {
        setFields({
          name: '',
          brand: '',
        });
        setModelYearPairs([
          { carBrand: '', model: '', yearFrom: '', yearTo: '', id: Date.now().toString() + '-0', keepUppercase: false }
        ]);
        setValidationErrors({});
      } else {
        setOilSpec({
          type: 'Моторное',
          brand: 'HYUNDAI/XTeer',
          viscosity: '15w40',
          specification: 'HD 7000 CI-4',
          volume: '1л'
        });
        setOilValidationErrors({});
      }

      // Добавляем новогоднюю анимацию при копировании
      const buttons = document.querySelectorAll('button');
      buttons.forEach(button => {
        if (button.textContent?.includes('Копировать')) {
          button.classList.add('animate-pulse');
          setTimeout(() => {
            button.classList.remove('animate-pulse');
          }, 1000);
        }
      });

      setTimeout(() => {
        setCopySuccess('');
      }, 2000);
    } catch (err) {
      console.error('Ошибка при копировании: ', err);
      setCopySuccess('Ошибка при копировании');

      setTimeout(() => {
        setCopySuccess('');
      }, 2000);
    }
  };

  const removeDoubleSpaces = (str: string): string => {
    return str.replace(/\s{2,}/g, ' ').trim();
  };

  const formatModelYearPairs = () => {
    const validPairs = modelYearPairs.filter(pair =>
      removeDoubleSpaces(pair.carBrand) !== '' || removeDoubleSpaces(pair.model) !== ''
    );

    if (validPairs.length === 0) return '';

    const groupedByBrand: Record<string, Array<{
      model: string,
      yearFrom: string,
      yearTo: string,
      originalYearFrom: string,
      originalYearTo: string
    }>> = {};

    validPairs.forEach(pair => {
      const carBrand = removeDoubleSpaces(pair.carBrand);
      const model = removeDoubleSpaces(pair.model);

      const brand = carBrand || '';
      if (!groupedByBrand[brand]) {
        groupedByBrand[brand] = [];
      }
      if (model) {
        groupedByBrand[brand].push({
          model: model,
          yearFrom: formatYearForDisplay(pair.yearFrom),
          yearTo: formatYearForDisplay(pair.yearTo),
          originalYearFrom: pair.yearFrom,
          originalYearTo: pair.yearTo
        });
      } else {
        groupedByBrand[brand].push({
          model: '',
          yearFrom: formatYearForDisplay(pair.yearFrom),
          yearTo: formatYearForDisplay(pair.yearTo),
          originalYearFrom: pair.yearFrom,
          originalYearTo: pair.yearTo
        });
      }
    });

    const result: string[] = [];

    Object.entries(groupedByBrand).forEach(([brand, models]) => {
      const nonEmptyModels = models.filter(m => m.model !== '');

      if (nonEmptyModels.length === 0 && brand !== '') {
        result.push(brand);
      } else if (nonEmptyModels.length > 0) {
        const formattedModels = nonEmptyModels.map(modelData => {
          const { model: modelName, yearFrom, yearTo } = modelData;

          const hasErrors = nonEmptyModels.some(m =>
            (m.originalYearFrom && validateYear(m.originalYearFrom)) ||
            (m.originalYearTo && validateYear(m.originalYearTo))
          );

          if (hasErrors) {
            return `${modelName} (ошибка валидации)`;
          }

          if (yearFrom && yearTo) {
            return `${modelName} ${yearFrom}->${yearTo}`;
          } else if (yearFrom) {
            return `${modelName} ${yearFrom}->`;
          } else if (yearTo) {
            return `${modelName} ->${yearTo}`;
          } else {
            return modelName;
          }
        });

        const hasMultipleBrands = Object.keys(groupedByBrand).length > 1;
        const hasMultipleModels = nonEmptyModels.length > 1;

        if (hasMultipleBrands || hasMultipleModels) {
          if (brand) {
            result.push(`${brand} ${formattedModels.join(', ')}`);
          } else {
            result.push(formattedModels.join(', '));
          }
        } else {
          if (brand) {
            result.push(`${brand} ${formattedModels[0]}`);
          } else {
            result.push(formattedModels[0]);
          }
        }
      }
    });

    return result.join(', ');
  };

  const formatOilSpecification = (): string => {
    const parts: string[] = [];

    parts.push('Масло');
    if (oilSpec.type) parts.push(removeDoubleSpaces(oilSpec.type.toLowerCase()));
    if (oilSpec.brand) parts.push(`"${removeDoubleSpaces(oilSpec.brand)}"`);
    if (oilSpec.viscosity) parts.push(removeDoubleSpaces(oilSpec.viscosity));
    if (oilSpec.specification) parts.push(removeDoubleSpaces(oilSpec.specification));
    if (oilSpec.volume) parts.push(removeDoubleSpaces(oilSpec.volume));

    return parts.join(' ');
  };

  const hasValidationErrors = () => {
    const partsErrors = Object.values(validationErrors).some(errorObj =>
      Object.values(errorObj).some(error => error !== undefined)
    );

    const oilErrors = Object.values(oilValidationErrors).some(errorObj =>
      Object.values(errorObj).some(error => error !== undefined)
    );

    return partsErrors || oilErrors;
  };

  const concatenatedResultForParts = () => {
    if (hasValidationErrors()) {
      return 'Пожалуйста, исправьте ошибки валидации';
    }

    const parts: string[] = [];

    const name = removeDoubleSpaces(fields.name);
    const brand = removeDoubleSpaces(fields.brand);

    if (name) parts.push(name);
    if (brand) parts.push(`"${brand}"`);

    const modelYearStr = formatModelYearPairs();

    if (modelYearStr) {
      parts.push(modelYearStr);
    }

    return removeDoubleSpaces(parts.join(' '));
  };

  const concatenatedResultForOils = () => {
    if (hasValidationErrors()) {
      return 'Пожалуйста, исправьте ошибки валидации';
    }

    const parts: string[] = [];

    // Name and brand are not included in oils mode
    const oilSpecStr = formatOilSpecification();
    if (oilSpecStr) parts.push(oilSpecStr);

    return removeDoubleSpaces(parts.join(' '));
  };

  const concatenatedResult = mode === 'parts'
    ? concatenatedResultForParts()
    : concatenatedResultForOils();

  const highlightDoubleSpaces = (text: string) => {
    if (!text) return text;

    const parts = text.split(/(\s{2,})/g);

    return parts.map((part, index) => {
      if (/\s{2,}/.test(part)) {
        return (
          <span key={index} className="bg-red-200 text-red-800 px-1 rounded">
            {part.replace(/ /g, '•')}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const hasDoubleSpaces = concatenatedResult && /\s{2,}/.test(concatenatedResult);

  const fieldConfigs = [
    { id: 'name', label: 'Название', key: 'name' as const },
    { id: 'brand', label: 'Брэнд', key: 'brand' as const },
  ];

  const oilSpecConfigs = [
    { id: 'oil-type', label: 'Тип масла', key: 'type' as const, placeholder: 'Например: Моторное, Трансмиссионное' },
    { id: 'oil-brand', label: 'Брэнд масла', key: 'brand' as const, placeholder: 'Например: HYUNDAI/XTeer' },
    { id: 'oil-viscosity', label: 'Вязкость', key: 'viscosity' as const, placeholder: 'Например: 15w40, 5w30' },
    { id: 'oil-spec', label: 'Спецификация', key: 'specification' as const, placeholder: 'Например: HD 7000 CI-4' },
    { id: 'oil-volume', label: 'Объем', key: 'volume' as const, placeholder: 'Например: 1л, 4л, 5л' },
  ];

  // Функция для выбора значения из автозаполнения
  const handleAutocompleteSelect = (value: string) => {
    if (!showAutocomplete) return;

    switch (showAutocomplete.field) {
      case 'name':
        setFields(prev => ({ ...prev, name: value }));
        break;
      case 'brand':
        setFields(prev => ({ ...prev, brand: value }));
        break;
      case 'carBrand':
        setModelYearPairs(prev =>
          prev.map(pair =>
            pair.id === modelYearPairs[0].id ? { ...pair, carBrand: value } : pair
          )
        );
        break;
      case 'model':
        setModelYearPairs(prev =>
          prev.map(pair =>
            pair.id === modelYearPairs[0].id ? { ...pair, model: value } : pair
          )
        );
        break;
      case 'oilType':
        setOilSpec(prev => ({ ...prev, type: value }));
        break;
      case 'oilBrand':
        setOilSpec(prev => ({ ...prev, brand: value }));
        break;
      case 'oilViscosity':
        setOilSpec(prev => ({ ...prev, viscosity: value }));
        break;
      case 'oilSpecification':
        setOilSpec(prev => ({ ...prev, specification: value }));
        break;
      case 'oilVolume':
        setOilSpec(prev => ({ ...prev, volume: value }));
        break;
    }

    setShowAutocomplete(null);
  };

  // Закрываем автозаполнение при клике вне его
  useEffect(() => {
    const handleClickOutside = () => {
      setShowAutocomplete(null);
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <div className="size-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-red-50 p-8 relative overflow-hidden">
      {/* Снегопад на заднем фоне */}
      <Snowfall />

      {/* Новогодние украшения */}
      <ChristmasDecorations />

      {/* Снежный градиентный оверлей */}
      <div className="fixed inset-0 snow-overlay pointer-events-none z-0" />

      <div className="w-full max-w-6xl bg-white/90 backdrop-blur-sm rounded-lg shadow-xl p-8 relative z-20 border-2 border-red-200 christmas-border">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold christmas-title animate-pulse">
            🎄 Car Parts Data Concatenator 🎄
          </h1>

          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => setShowHistory(!showHistory)}
              className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md border border-green-300 bg-white text-gray-700 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-300 hover:scale-105"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              История ({history.length})
            </button>

            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700 mr-2">Режим:</span>
              <div className="inline-flex rounded-md shadow-sm" role="group">
                <button
                  type="button"
                  onClick={() => setMode('parts')}
                  className={`px-4 py-2 text-sm font-medium rounded-l-lg border transition-all duration-300 ${mode === 'parts'
                    ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white border-blue-600 hover:from-blue-700 hover:to-green-700'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  🛠️ Запчасти
                </button>
                <button
                  type="button"
                  onClick={() => setMode('oils')}
                  className={`px-4 py-2 text-sm font-medium rounded-r-lg border transition-all duration-300 ${mode === 'oils'
                    ? 'bg-gradient-to-r from-green-600 to-red-600 text-white border-green-600 hover:from-green-700 hover:to-red-700'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  🛢️ Масла
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Новогоднее поздравление */}
        <div className="mb-6 p-4 bg-gradient-to-r from-red-100 via-green-100 to-blue-100 rounded-lg border-2 border-dashed border-red-300 animate-pulse">
          <div className="flex items-center justify-center space-x-4">
            <span className="text-2xl">🎅</span>
            <p className="text-center text-gray-800 font-medium">
              С Наступающим Новым Годом! 🎄 Пусть ваш код всегда будет чистым, а баги обходят стороной! ✨
            </p>
            <span className="text-2xl">🦌</span>
          </div>
        </div>

        {/* Панель истории */}
        {showHistory && (
          <div className="mb-6 border-2 border-green-300 rounded-lg bg-gradient-to-br from-white to-green-50 p-4 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <span className="mr-2">📜</span> История результатов
              </h3>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={clearHistory}
                  className="text-sm text-red-600 hover:text-red-800 hover:scale-105 transition-transform"
                  disabled={history.length === 0}
                >
                  Очистить историю
                </button>
                <button
                  type="button"
                  onClick={() => setShowHistory(false)}
                  className="text-sm text-gray-600 hover:text-gray-800 hover:scale-105 transition-transform"
                >
                  Скрыть
                </button>
              </div>
            </div>

            {history.length === 0 ? (
              <p className="text-gray-500 text-center py-4">История пуста 📭</p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-white border border-gray-200 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-md"
                    onClick={() => applyHistoryItem(item)}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {item.result.length > 80 ? item.result.substring(0, 80) + '...' : item.result}
                      </span>
                      <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs px-2 py-1 rounded ${item.mode === 'parts'
                        ? 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800'
                        : 'bg-gradient-to-r from-green-100 to-green-200 text-green-800'
                        }`}>
                        {item.mode === 'parts' ? '🛠️ Запчасти' : '🛢️ Масла'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(item.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="space-y-6">
          {/* Only show name and brand fields in parts mode */}
          {mode === 'parts' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fieldConfigs.map(({ id, label, key }) => (
                <div key={id} className="relative">
                  <label htmlFor={id} className="block mb-2 text-sm font-medium text-gray-700 flex items-center">
                    <span className="mr-2">📝</span> {label}
                  </label>
                  <input
                    id={id}
                    type="text"
                    value={fields[key]}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(key, e.target.value, e)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ${validationErrors[key]?.doubleSpaces ? 'border-yellow-500 bg-yellow-50' : 'border-gray-300'
                      }`}
                    placeholder={capitalizeWords(label)}
                  />
                  {validationErrors[key]?.doubleSpaces && (
                    <p className="mt-1 text-xs text-yellow-600 flex items-center">
                      <span className="mr-1">⚠️</span> {validationErrors[key]?.doubleSpaces}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Только первое слово с заглавной буквы, остальные - как введены.
                    <br />
                    <span className="text-red-500">Двойные пробелы автоматически удаляются.</span>
                  </p>
                </div>
              ))}
            </div>
          )}

          {mode === 'parts' ? (
            <div className="border-t-2 border-blue-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <span className="mr-2">🚗</span> Марка авто, модели и годы выпуска
                </h3>
                <button
                  type="button"
                  onClick={addModelYearPair}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 hover:scale-105"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Добавить модель
                </button>
              </div>

              <div className="space-y-4">
                {modelYearPairs.map((pair, index) => {
                  const pairErrors = validationErrors[pair.id] || {};

                  return (
                    <div key={pair.id} className="flex items-center gap-4 p-4 bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-all duration-300">
                      <div className="flex-grow grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div className="col-span-1 relative">
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-sm font-medium text-gray-700">
                              {`🚙 Марка авто ${modelYearPairs.length > 1 ? `#${index + 1}` : ''}`}
                            </label>
                            <button
                              type="button"
                              onClick={() => toggleUppercaseMode(pair.id)}
                              className={`text-xs px-2 py-1 rounded transition-colors ${pair.keepUppercase
                                ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white hover:from-yellow-600 hover:to-yellow-700'
                                : 'bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700 hover:from-gray-300 hover:to-gray-400'
                                }`}
                              title={pair.keepUppercase ? "Отключить CAPS" : "Оставить CAPS"}
                            >
                              {pair.keepUppercase ? '🔠 CAPS ВКЛ' : '🔡 CAPS'}
                            </button>
                          </div>
                          <input
                            type="text"
                            value={pair.carBrand}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              handleModelChange(pair.id, 'carBrand', e.target.value, e)
                            }
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ${pairErrors.doubleSpaces ? 'border-yellow-500 bg-yellow-50' : 'border-gray-300'
                              }`}
                            placeholder="Например: VW или BMW"
                          />
                          {pairErrors.doubleSpaces && (
                            <p className="mt-1 text-xs text-yellow-600 flex items-center">
                              <span className="mr-1">⚠️</span> {pairErrors.doubleSpaces}
                            </p>
                          )}
                          <p className="mt-1 text-xs text-gray-500">
                            {pair.keepUppercase
                              ? 'Заглавные буквы сохраняются. Двойные пробелы удаляются.'
                              : 'Первая буква заглавная, остальные строчные. Двойные пробелы удаляются.'}
                          </p>
                        </div>
                        <div className="col-span-1 relative">
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-sm font-medium text-gray-700">
                              {`🏎️ Модель ${modelYearPairs.length > 1 ? `#${index + 1}` : ''}`}
                            </label>
                            <button
                              type="button"
                              onClick={() => toggleUppercaseMode(pair.id)}
                              className={`text-xs px-2 py-1 rounded transition-colors ${pair.keepUppercase
                                ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white hover:from-yellow-600 hover:to-yellow-700'
                                : 'bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700 hover:from-gray-300 hover:to-gray-400'
                                }`}
                              title={pair.keepUppercase ? "Отключить CAPS" : "Оставить CAPS"}
                            >
                              {pair.keepUppercase ? '🔠 CAPS ВКЛ' : '🔡 CAPS'}
                            </button>
                          </div>
                          <input
                            type="text"
                            value={pair.model}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              handleModelChange(pair.id, 'model', e.target.value, e)
                            }
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ${pairErrors.doubleSpaces ? 'border-yellow-500 bg-yellow-50' : 'border-gray-300'
                              }`}
                            placeholder="Например: Passat или X5"
                          />
                          {pairErrors.doubleSpaces && (
                            <p className="mt-1 text-xs text-yellow-600 flex items-center">
                              <span className="mr-1">⚠️</span> {pairErrors.doubleSpaces}
                            </p>
                          )}
                          <p className="mt-1 text-xs text-gray-500">
                            {pair.keepUppercase
                              ? 'Заглавные буквы сохраняются. Двойные пробелы удаляются.'
                              : 'Только первое слово с заглавной буквы. Двойные пробелы удаляются.'}
                          </p>
                        </div>
                        <div>
                          <label className="block mb-1 text-sm font-medium text-gray-700">
                            {`📅 Год от ${modelYearPairs.length > 1 ? `#${index + 1}` : ''}`}
                          </label>
                          <input
                            type="text"
                            value={pair.yearFrom}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              handleModelChange(pair.id, 'yearFrom', e.target.value, e)
                            }
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ${pairErrors.yearFrom ? 'border-red-500 bg-red-50' : 'border-gray-300'
                              }`}
                            placeholder="Например: 1974 или 74"
                            maxLength={4}
                          />
                          {pairErrors.yearFrom && (
                            <p className="mt-1 text-xs text-red-600 flex items-center">
                              <span className="mr-1">❌</span> {pairErrors.yearFrom}
                            </p>
                          )}
                          <p className="mt-1 text-xs text-gray-500">
                            {pair.yearFrom && !pairErrors.yearFrom && `Будет показано: ${formatYearForDisplay(pair.yearFrom)}`}
                          </p>
                        </div>
                        <div>
                          <label className="block mb-1 text-sm font-medium text-gray-700">
                            {`📅 Год до ${modelYearPairs.length > 1 ? `#${index + 1}` : ''}`}
                          </label>
                          <input
                            type="text"
                            value={pair.yearTo}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              handleModelChange(pair.id, 'yearTo', e.target.value, e)
                            }
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ${pairErrors.yearTo ? 'border-red-500 bg-red-50' : 'border-gray-300'
                              }`}
                            placeholder="Например: 1997 или 97"
                            maxLength={4}
                          />
                          {pairErrors.yearTo && (
                            <p className="mt-1 text-xs text-red-600 flex items-center">
                              <span className="mr-1">❌</span> {pairErrors.yearTo}
                            </p>
                          )}
                          <p className="mt-1 text-xs text-gray-500">
                            {pair.yearTo && !pairErrors.yearTo && `Будет показано: ${formatYearForDisplay(pair.yearTo)}`}
                          </p>
                        </div>
                      </div>

                      {modelYearPairs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeModelYearPair(pair.id)}
                          className="self-end p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-all duration-300 hover:scale-110"
                          title="Удалить"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="border-t-2 border-green-200 pt-6">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <span className="mr-2">🛢️</span> Спецификация масла
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {oilSpecConfigs.map(({ id, label, key, placeholder }) => (
                    <div key={id} className="relative">
                      <label htmlFor={id} className="block mb-2 text-sm font-medium text-gray-700">
                        {label}
                      </label>
                      <input
                        id={id}
                        type="text"
                        value={oilSpec[key]}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleOilSpecChange(key, e.target.value, e)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 ${oilValidationErrors[key]?.doubleSpaces ? 'border-yellow-500 bg-yellow-50' : 'border-gray-300'
                          }`}
                        placeholder={placeholder}
                      />
                      {oilValidationErrors[key]?.doubleSpaces && (
                        <p className="mt-1 text-xs text-yellow-600 flex items-center">
                          <span className="mr-1">⚠️</span> {oilValidationErrors[key]?.doubleSpaces}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">
                        Двойные пробелы автоматически удаляются.
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Автозаполнение */}
        {showAutocomplete && (
          <div
            className="fixed z-50 bg-white border-2 border-blue-300 rounded-md shadow-xl max-h-48 overflow-y-auto"
            style={{
              top: showAutocomplete.position.top,
              left: showAutocomplete.position.left,
              minWidth: '200px'
            }}
          >
            {showAutocomplete.values.map((value, index) => (
              <div
                key={index}
                className="px-3 py-2 hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-all duration-200"
                onClick={() => handleAutocompleteSelect(value)}
              >
                <div className="text-sm text-gray-700 truncate">{value}</div>
              </div>
            ))}
          </div>
        )}

        <div className="border-t-2 border-gradient-to-r from-red-200 via-green-200 to-blue-200 pt-6 mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center">
              {mode === 'parts' ? (
                <>
                  <span className="mr-2">🛠️</span> Результат (Запчасти):
                </>
              ) : (
                <>
                  <span className="mr-2">🛢️</span> Результат (Масла):
                </>
              )}
            </h2>
            <div className="relative">
              <button
                type="button"
                onClick={copyToClipboard}
                disabled={!concatenatedResult || concatenatedResult === 'Пожалуйста, исправьте ошибки валидации'}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 hover:scale-105 ${!concatenatedResult || concatenatedResult === 'Пожалуйста, исправьте ошибки валидации'
                  ? 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-600 via-red-500 to-blue-600 hover:from-green-700 hover:via-red-600 hover:to-blue-700 focus:ring-green-500'
                  }`}
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                📋 Копировать
              </button>

              {copySuccess && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1 bg-gradient-to-r from-green-100 to-green-200 text-green-800 text-xs font-medium rounded-md shadow-lg animate-fadeIn border border-green-300">
                  🎉 {copySuccess}
                </div>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-100 to-blue-50 p-4 rounded-md min-h-[60px] border-2 border-gray-200">
            <div className={`break-words font-mono ${concatenatedResult === 'Пожалуйста, исправьте ошибки валидации'
              ? 'text-red-600'
              : 'text-gray-800'
              }`}>
              {concatenatedResult ? (
                <>
                  <div className="flex items-start">
                    <span className="mr-2 mt-1">📄</span>
                    <div>
                      {highlightDoubleSpaces(concatenatedResult)}
                      {hasDoubleSpaces && (
                        <div className="mt-2 p-2 bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded text-sm text-yellow-800">
                          <div className="flex items-start">
                            <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <div>
                              <p className="font-medium">⚠️ Обнаружены двойные пробелы!</p>
                              <p className="mt-1">Двойные пробелы будут автоматически удалены при копировании.</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center text-gray-500">
                  <span className="mr-2">📝</span> Заполните поля выше, чтобы увидеть результат...
                </div>
              )}
            </div>
          </div>

          {/* Новогодний подвал */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 flex items-center justify-center">
              <span className="mr-2">✨</span>
              С Новым Годом! Пусть все проекты будут успешными!
              <span className="ml-2">🎁</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}