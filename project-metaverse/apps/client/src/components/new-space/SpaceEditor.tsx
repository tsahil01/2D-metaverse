import { ElementInterface, ElementWithPositionInterface } from "@/lib/types";
import { useEffect, useState, useCallback } from "react";
import Phaser from "phaser";
import { BACKEND_URL } from "@/lib/config";
import { Button } from "../ui/button";

interface MapEditorProps {
  name: string;
  thumbnail: string;
  dimension: string;
}

export function SpaceEditor({ name, thumbnail, dimension }: MapEditorProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [elements, setElements] = useState<ElementWithPositionInterface[]>([]);
  const [availableElements, setAvailableElements] = useState<ElementInterface[]>([]);

  const fetchElements = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/elements`);
      const data = await response.json();
      console.log(data);
      setAvailableElements(data.elements);
    } catch (error) {
      console.error("Failed to fetch elements:", error);
    }
  };

  async function addElementsToSpace(spaceId: string, elementId: string, x: number, y: number) {
    try {
      const response = await fetch(`${BACKEND_URL}/space/element`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          spaceId,
          elementId,
          x,
          y,

        }),
      });
      const data = await response.json();
      console.log("Added elements to space successfully", data);
    } catch (error) {
      console.error("Failed to add elements to space", error);
      alert("Failed to add elements to space");
    }
  }


  async function createSpace() {
    console.log("Creating space", thumbnail, name, dimension);
    const res = await fetch(`${BACKEND_URL}/space`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        name,
        dimension,
        thumbnail,
      }),
    });

    const data = await res.json();
    console.log(data);
    if (data.spaceId) {
      alert("Space created successfully");
      elements.forEach(async (element) => {
        await addElementsToSpace(data.spaceId, element.id, element.x, element.y);
      });
    } else {
      alert("Failed to create space");
    }
  }

  useEffect(() => {
    fetchElements();
  }, []);

  const handleElementDrop = useCallback((element: ElementInterface) => {
    if (isEditMode) {
      const newElement: ElementWithPositionInterface = {
        ...element,
        x: parseInt(dimension.split("x")[0]) / 2,
        y: parseInt(dimension.split("x")[1]) / 2,
      };
      setElements(prev => [...prev, newElement]);
    }
  }, [isEditMode]);

  useEffect(() => {
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: parseInt(dimension.split("x")[0]),
      height: parseInt(dimension.split("x")[1]),
      parent: "phaser-game",
      physics: {
        default: "arcade",
        arcade: {
          debug: false,
        },

      },
      audio: {
        disableWebAudio: true,
      },
      scene: {
        preload,
        create,
        update,
      },
    };

    const game = new Phaser.Game(config);
    let gridGraphics: Phaser.GameObjects.Graphics;
    let draggedItem: Phaser.Physics.Arcade.Sprite | null = null;
    const gameElements: Phaser.Physics.Arcade.Sprite[] = [];

    function preload(this: Phaser.Scene) {

      this.load.image("floor", "/assets/floor.png");

      // Load element assets
      [...elements, ...availableElements].forEach((item) => {
        if (item.name) {

          this.load.image(item.name, item.imageUrl);
        } else {
          this.load.image("some" + Math.random(), item.imageUrl);
        }
      });
    }

    function drawGrid(this: Phaser.Scene) {
      if (gridGraphics) {
        gridGraphics.clear();
      } else {
        gridGraphics = this.add.graphics();
      }

      if (isEditMode) {
        gridGraphics.lineStyle(1, 0xffffff, 0.3);
        const cellSize = 32;
        const width = config.width as number;
        const height = config.height as number;

        for (let x = 0; x <= width; x += cellSize) {
          gridGraphics.moveTo(x, 0);
          gridGraphics.lineTo(x, height);
        }

        for (let y = 0; y <= height; y += cellSize) {
          gridGraphics.moveTo(0, y);
          gridGraphics.lineTo(width, y);
        }

        gridGraphics.strokePath();
      }
    }

    function updateElementsState() {
      const updatedElements = gameElements.map(sprite => ({
        id: sprite.getData('id'),
        name: sprite.texture.key,
        imageUrl: sprite.getData('imageUrl'),
        static: sprite.getData('static'),
        width: sprite.width,
        height: sprite.height,
        x: sprite.x,
        y: sprite.y
      }));
      setElements(updatedElements);
    }

    function setupDragEvents(sprite: Phaser.Physics.Arcade.Sprite) {
      sprite.setInteractive({ draggable: true });

      sprite.on('dragstart', function () {
        draggedItem = sprite;
      });

      sprite.on('drag', function (pointer: Phaser.Input.Pointer) {
        if (draggedItem && isEditMode) {
          const gridSize = 32;
          const x = Math.round(pointer.x / gridSize) * gridSize;
          const y = Math.round(pointer.y / gridSize) * gridSize;
          draggedItem.setPosition(x, y);
        }
      });

      sprite.on('dragend', function () {
        if (draggedItem && isEditMode) {
          updateElementsState();
        }
        draggedItem = null;
      });
    }

    function create(this: Phaser.Scene) {
      const width = config.width as number;
      const height = config.height as number;

      // Add floor tiles
      for (let i = 0; i <= width; i += 32) {
        for (let j = 0; j <= height; j += 32) {
          this.add.image(i, j, "floor");
        }
      }

      // Create game elements
      elements.forEach((item) => {
        const element = this.physics.add.sprite(item.x, item.y, item.name);
        element.setData('id', item.id);
        element.setData('static', item.static);
        element.setData('imageUrl', item.imageUrl);

        if (item.static) {
          element.setImmovable(true);
        }
        element.body.setAllowGravity(false);
        element.setDepth(item.y);

        if (isEditMode) {
          setupDragEvents(element);
        }
        gameElements.push(element);
      });

      drawGrid.call(this);
    }

    function update(this: Phaser.Scene) {
      drawGrid.call(this);
    }

    return () => {
      game.destroy(true);
    };
  }, [isEditMode, availableElements, elements]);

  return (
    <div className="flex flex-col gap-4 mt-8 border-t pt-4">
      <div className="space-x-4 flex flex-row items-end">
        <Button
          className={`px-4 py-2 rounded ${isEditMode ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
            } text-white transition-colors`}
          onClick={() => setIsEditMode(!isEditMode)}
        >
          {isEditMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}
        </Button>
        {!isEditMode && (elements.length != 0) && (
          <Button
            className="px-4 py-2 rounded text-white transition-colors"
            onClick={createSpace}
          >
            Save Space
          </Button>
        )}
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div id="phaser-game" className="p-3 col-span-3 bg-primary/5 rounded-lg overflow-scroll" />

        {isEditMode && (
          <div className="w-64 bg-primary/5 p-4 overflow-y-auto col-span-1 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Available Elements</h2>
            <div className="text-sm mb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Walkable (player can move through)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Obstacle (blocks player movement)</span>
              </div>
            </div>
            <div className="space-y-4">
              {availableElements.map((element) => (
                <div
                  key={element.id}
                  className={`relative bg-gray-700 p-4 rounded cursor-pointer hover:bg-gray-600 transition-colors ${element.static ? 'border-red-500' : 'border-green-500'
                    } border-2`}
                  onClick={() => handleElementDrop(element)}
                >
                  <div
                    className={`absolute top-2 right-2 w-3 h-3 rounded-full ${element.static ? 'bg-red-500' : 'bg-green-500'
                      }`}
                  />
                  <img
                    src={element.imageUrl}
                    alt={element.name}
                    className="w-full h-32 object-contain mb-2"
                  />
                  <p className="text-white text-center">{element.name}</p>
                  <p className="text-gray-400 text-xs text-center mt-1">
                    {element.static ? 'Blocks movement' : 'Walkable'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}